import requests
import json
import os
import re
from dotenv import load_dotenv
import logging

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)
load_dotenv()
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434/api/chat')
MODEL_NAME = os.getenv('MODEL_NAME', 'llama3')

QUERY_TYPE_SQL = 'sql'
QUERY_TYPE_PANDAS = 'pandas'

def get_sql_query(user_query, schema_info):
  # Prompt needs to be super specific, following prompt worked better during testing
  prompt = f"""You're an SQL assistant. Using the following database schema:

{schema_info}

When writing the query, follow these guidelines carefully:

1. Match string values exactly — don't abbreviate or change names (e.g., match 'New York City' as-is, not just 'New York').
2. Use column names exactly as shown in the schema — don't shorten, rename, or guess.
3. SQL string comparisons are case-sensitive. Use LOWER() or UPPER() to make filters case-insensitive when needed.
4. For CSV data, always treat the table name as 'data' — no exceptions.
5. For queries involving locations (e.g., 'GO', 'NY'), look for relevant columns like 'state', 'state_code', 'region', etc.
6. To handle case-insensitive filtering by state or code, use expressions like:
   WHERE LOWER(state) = 'go' or WHERE UPPER(state) = 'GO'
7. When using aggregation functions (e.g., COUNT(), SUM(), AVG()), make sure to include a GROUP BY for any non-aggregated columns.
8. For popularity-type queries (e.g., most/least frequent items), group by the relevant column and use COUNT(), then sort appropriately. For example:
   SELECT product_name, COUNT(*) AS count FROM data GROUP BY product_name ORDER BY count DESC LIMIT 1
9. In SQLite, be careful with aggregates — GROUP BY is required, and avoid using COUNT(*) in ORDER BY without proper grouping.

return **only** the SQL query — no explanations, comments, or markdown.

Finally, please generate a valid SQL query to answer this question: "{user_query}"
"""
  
    # setup request payload
  stuff_to_send = {
    "model": MODEL_NAME,
    "messages": [
      {"role": "user", "content": prompt}
    ],
    "stream": False
  }
  
  try:
    res = requests.post(OLLAMA_API_URL, json=stuff_to_send)
    res.raise_for_status() 
    data = res.json()
    query = data.get('message', {}).get('content', '').strip()
    return {
      "success": True,
      "query_type": QUERY_TYPE_SQL,
      "sql_query": query
    }
  except Exception as e:
    return {
      "success": False,
      "error": str(e),
      "message": "Failed to generate SQL query"
    }

def get_pandas_query(user_query, schema_info):
  export_meta = detect_export_meta(user_query)
  
  cols = []  
  if "Database Schema:" in schema_info:
    lines = schema_info.split('\n')
    for l in lines:  
      if "Columns:" in l:
        cols_part = l.split("Columns:")[1].strip()
        cols = [c.strip() for c in cols_part.split(',')]  
  logger.debug(f"Available columns: {cols}")
  
  if export_meta.get("is_export", False):
    mapped = export_meta.get("mapped_columns") or export_meta.get("columns") or []
    if not mapped:
      mapped = cols
    export_meta["mapped_columns"] = mapped
    if mapped:
      columnList = ", ".join([f"'{col}'" for col in mapped])  
      pandas_query = f"df[[col for col in [{columnList}] if col in df.columns]]"
    else:
      pandas_query = "df"

    return {
      "success": True,
      "query_type": QUERY_TYPE_PANDAS,
      "pandas_query": pandas_query,
      "export_meta": export_meta
    }
  
    # again needs to be super specific
  prompt = f"""You are a helpful Python data analysis assistant. Given the following CSV file schema information:

{schema_info}

When generating Pandas queries, please follow these guidelines:
1. The CSV file is already loaded into a Pandas DataFrame called df — use it directly in your query.
2. Use the exact string values shown in the examples — don’t shorten or tweak them.
3. Use the exact column names from the schema — don’t rename, abbreviate, or modify them.
4. For filtering operations, use the appropriate Pandas methods (df.loc, df.query, etc.).
5. For aggregation queries, use groupby(), agg(), etc. appropriately.
6. For queries involving states or locations (like ‘GO’, ‘CA’, or ‘NY’), make comparisons case-insensitive when needed.
7. For popularity or frequency analysis, use value_counts() or groupby() with size() or count().
8. Just return the columns that are actually relevant
9. Limit the number of results when appropriate (e.g., using .head(N) for top N queries).
10. Use proper Pandas syntax and best practices.
11. Write your code as a single expression that returns either a DataFrame or a Series — no multi-step code.
12. Avoid using any print() statements — just return the final DataFrame.
13. Don’t include any imports, explanations, or extra code — just the data manipulation expression.
14. When creating frequency counts, use this exact pattern for every data analysis task:
    df['column_name'].value_counts().reset_index().rename(columns={{'index': 'column_display_name', 'column_name': 'count'}}).head(N)
15. Never use duplicate column names in your result - ensure each column has a unique name
16. For export requests, filter and select only the requested columns. Ensure the requested columns exist in the DataFrame.
"""
  
  if export_meta.get("is_export", False):
    columnList = ", ".join([f"'{col}'" for col in export_meta["mapped_columns"]])
    prompt += f"\n\nThis query is an EXPORT request. Generate code that selects these columns: [{columnList}]\n"
    prompt += f"Your export code MUST check if each column exists before selecting it. Only select columns that exist in the dataframe.\n"
    prompt += f"For example, use: df[[col for col in [{columnList}] if col in df.columns]]\n"
  prompt += f"\nGenerate ONLY a single valid Python/Pandas expression to answer this question: \"{user_query}\"\n"
  prompt += "\nReturn ONLY the final expression without any explanation, comments or markdown formatting."
  if export_meta.get("is_export", False):
    prompt += f"\n\nExport Intent Detected: {export_meta.get('format', '')} format, template type: {export_meta.get('template_type', '')}, requested columns: {export_meta.get('columns', [])}, mapped columns: {export_meta.get('mapped_columns', [])}"
  
  params = {  
    "model": MODEL_NAME,
    "messages": [
      {"role": "user", "content": prompt}
    ],
    "stream": False
  }
  
  try:
    resp = requests.post(OLLAMA_API_URL, json=params)  
    resp.raise_for_status() 
    data = resp.json()
    pandas_query = data.get('message', {}).get('content', '').strip()
    
    return {
      "success": True,
      "query_type": QUERY_TYPE_PANDAS,
      "pandas_query": pandas_query
    }
  except Exception as e:
    return {
      "success": False,
      "error": str(e),
      "message": "Failed to generate Pandas query"
    }

def detect_export_meta(user_query):
  q = user_query.lower()  

  # Check for export intent keywords
  export_keywords = ["export", "download", "save", "extract", "output", "create"]
  has_export_meta = any(keyword in q for keyword in export_keywords)
  if not has_export_meta:
    return {"is_export": False}
  
  # Detect format
  formats = {
    "csv": ["csv", "comma separated"],
    "excel": ["excel", "xlsx", "spreadsheet", "report"],
    "json": ["json", "javascript object"]
  }
  
  detected_format = None
  for format_name, format_keywords in formats.items():
    if any(keyword in q for keyword in format_keywords):
      detected_format = format_name
      break
  
  template_type = "basic"
  if "report" in q or "summary" in q:
    template_type = "report"
  elif "nested" in q or "metadata" in q:
    template_type = "nested"
  
  common_prefixes = [
    "customer_", "order_", "product_", "seller_", "item_"
  ]
  potential_columns = []
  col_pattern = r'(customer_\w+|order_\w+|product_\w+|seller_\w+|item_\w+)'
  col_matches = re.findall(col_pattern, q)
  potential_columns.extend(col_matches)
  
    # specific to df_customers file; check for words like "id", "state", "city", etc.
  column_keywords = ["id", "state", "city", "zip", "code", "prefix", "name", "price", "amount"]
  for keyword in column_keywords:
    if keyword in q and not any(f"_{keyword}" in col for col in potential_columns):
      for prefix in ["customer", "order", "product", "seller", "item"]:
        if prefix in q and f"{prefix}_{keyword}" not in potential_columns:
          potential_columns.append(f"{prefix}_{keyword}")
  
  identified_columns = []
  if potential_columns:
    for col in potential_columns:
      clean_col = col.rstrip('.,;:!?')
      identified_columns.append(clean_col)
    columns = list(set(identified_columns))
  columns.sort(key=len, reverse=True)
  export_meta = {
    "is_export": True,
    "format": detected_format,
    "template_type": template_type,
    "columns": columns,
    "mapped_columns": []
  }
  return export_meta

# Generate a natural language explanation 
def explain_query_results(results, user_query):
  prompt = f"""Based on the following query results for the question "{user_query}":

{results}

Provide a clear, concise explanation of what these results mean in plain English. Focus only on the key insights, facts, and patterns within the data. Keep your response direct, factual, and avoid showing your thinking process or mentioning the SQL query. Make it sound like a direct answer to the user's question in a conversational tone, under 3-4 sentences if possible.
"""
  
  req_data = {  
    "model": MODEL_NAME,
    "messages": [
      {"role": "user", "content": prompt}
    ],
    "stream": False
  }
  
  try:
    resp = requests.post(OLLAMA_API_URL, json=req_data)
    resp.raise_for_status()
    raw_response = resp.json()
    explanation = raw_response.get('message', {}).get('content', '').strip()
    return {
      "success": True,
      "explanation": explanation
    }
  except Exception as e:
    logger.error(f"Error generating Explanation: {str(e)}")
    return {
      "success": False,
      "explanation": f"Results for your query: '{user_query}'"
    }
