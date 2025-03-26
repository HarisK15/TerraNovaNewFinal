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
  # Always set is_export to False since we're removing export intent detection
  export_meta = {"is_export": False}
  
  cols = []  
  if "Database Schema:" in schema_info:
    lines = schema_info.split('\n')
    for l in lines:  
      if "Columns:" in l:
        cols_part = l.split("Columns:")[1].strip()
        cols = [c.strip() for c in cols_part.split(',')]  
  logger.debug(f"Available columns: {cols}")
  
  prompt = f"""You are a data query assistant that helps translate natural language questions into Pandas code.

Given the following CSV file schema information:

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

Generate ONLY a single valid Python/Pandas expression to answer this question: \"{user_query}\"\n
Return ONLY the final expression without any explanation, comments or markdown formatting.
"""
  
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
      "pandas_query": pandas_query,
      "export_meta": export_meta
    }
  except Exception as e:
    return {
      "success": False,
      "error": str(e),
      "message": "Failed to generate Pandas query",
      "export_meta": {"is_export": False}
    }

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
