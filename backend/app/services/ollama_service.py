import requests
import json
import os
import re
from dotenv import load_dotenv
import logging
from app.utils.rag_examples import (
    find_examples, 
    guess_relevant_files, 
    get_file_connections,
    format_examples_for_prompt
)
from app.utils.db_handler import get_enhanced_schema_with_samples

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

def get_sql_query(user_query, schema_info, file_path=None):
  # enhanced schema with sample data 
  if file_path:
    enhanced_schema = get_enhanced_schema_with_samples(file_path)
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    examples = find_examples(user_query, file_name)
    examples_text = format_examples_for_prompt(examples)
  else:
    enhanced_schema = schema_info
    examples_text = ""
  
  # Prompt needs to be super specific, following prompt worked better during testing
  prompt = f"""You're an SQL assistant. Using the following database schema and sample data:

{enhanced_schema}
{examples_text}

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

Specific handling for common queries:
- When asked for "first N rows", always use "SELECT * FROM table LIMIT N"
- For "total" or "sum" questions, use SUM() with appropriate GROUP BY
- For "count" or "how many" questions, use COUNT() with appropriate GROUP BY
- For "average" questions, use AVG() function

return **only** the SQL query — no explanations, comments, or markdown.

Finally, please generate a valid SQL query to answer this question: "{user_query}"
"""
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

def get_pandas_query(user_query, schema_info, file_path=None):
  export_meta = {"is_export": False}
  
  if file_path:
    enhanced_schema = get_enhanced_schema_with_samples(file_path)
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    relationship_info = get_file_connections(file_name)
    examples = find_examples(user_query, file_name)
    examples_text = format_examples_for_prompt(examples)
  else:
    enhanced_schema = schema_info
    relationship_info = ""
    examples_text = ""
  
  cols = []  
  if "Database Schema:" in enhanced_schema:
    lines = enhanced_schema.split('\n')
    for l in lines:  
      if "Columns:" in l:
        cols_part = l.split("Columns:")[1].strip()
        cols = [c.strip() for c in cols_part.split(',')]  
  logger.debug(f"Available columns: {cols}")
  
  prompt = f"""You are a data query assistant that helps translate natural language questions into Pandas code.

Given the following CSV file schema and sample data:

{enhanced_schema}
{relationship_info}
{examples_text}

When generating Pandas queries, please follow these guidelines:
1. The CSV file is already loaded into a Pandas DataFrame called df — use it directly in your query.
2. Use the exact string values shown in the examples — don't shorten or tweak them.
3. Use the exact column names from the schema — don't rename, abbreviate, or modify them.
4. For filtering operations, use the appropriate Pandas methods (df.loc, df.query, etc.).
5. For aggregation queries, use groupby(), agg(), etc. appropriately.
6. For queries involving states or locations (like 'GO', 'CA', or 'NY'), make comparisons case-insensitive when needed.
7. For popularity or frequency analysis, use value_counts() or groupby() with size() or count().
8. Just return the columns that are actually relevant
9. Limit the number of results when appropriate (e.g., using .head(N) for top N queries).
10. Use proper Pandas syntax and best practices.
11. Write your code as a single expression that returns either a DataFrame or a Series — no multi-step code.

For Date//Time handling:
- always use pd.to_datetime() with errors='coerce' when working with date/time columns
- For time differences, never subtract strings directly:
  WRONG: df['order_delivered_timestamp'] - df['order_purchase_timestamp']
  CORRECT: pd.to_datetime(df['order_delivered_timestamp'], errors='coerce') - pd.to_datetime(df['order_purchase_timestamp'], errors='coerce')
- Access the days component with .dt.days after calculating a timedelta
- If working with a specific order ID, first confirm it exists before calculating:
  ```
  order = df[df['order_id'] == 'specific_id']
  if len(order) > 0:
      # then perform date calculations
  ```

Specific handling for common queries:
- When asked for "first N rows", always use "df.head(N)"
- For "total" or "sum" questions, use df.groupby().sum() with appropriate column
- For "count" or "how many" questions, use len(), count(), or value_counts()
- For "average" or "mean" questions, use mean() function on appropriate column
- For order information (like "when was order X delivered"), use appropriate filtering on order_id

Return only the pandas code to execute — no explanations, comments, or markdown. Use a one-line expression that can be directly executed:

Translate this question: "{user_query}"
"""

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
    query = clean_code_response(query)
    
    return {
      "success": True,
      "query_type": QUERY_TYPE_PANDAS,
      "pandas_query": query,
      "export_meta": export_meta
    }
  except Exception as e:
    logger.exception(f"Error in get_pandas_query: {str(e)}")
    return {
      "success": False,
      "error": str(e),
      "message": "Failed to generate pandas query"
    }

# Clean the LLM code response to remove markdown and other annotations
def clean_code_response(response):
  code = re.sub(r'```python\s*', '', response)
  code = re.sub(r'```\s*', '', code)
  
  # Remove any comments
  code = re.sub(r'#.*$', '', code, flags=re.MULTILINE)
  
  # Remove any explanations before or after the code and only get pandas code
  if 'df' in code:
    code_lines = code.split('\n')
    pandas_lines = []
    in_code_block = False
    
    for line in code_lines:
      if 'df' in line:
        in_code_block = True
        pandas_lines.append(line)
      elif in_code_block and line.strip() and not line.startswith('```'):
        pandas_lines.append(line)
    
    code = '\n'.join(pandas_lines)
  
  return code.strip()

# Generate a natural language explanation 
def explain_query_results(results, user_query):
  try:
    if not results.get("success", False):
      return f"Problem executing: {results.get('error', 'Unknown error')}"
    
    # Limit the amount of data we send to the model
    data_preview = results.get("data", [])
    if isinstance(data_preview, list) and len(data_preview) > 5:
      data_preview = data_preview[:5]
      trunc_note = "(showing first 5 rows)"
    else:
      trunc_note = ""
    
    prompt = f"""Given the following query and results, provide a clear and concise explanation of the data:

Query: "{user_query}"

Results: {json.dumps(data_preview, indent=2)} {trunc_note}

Explain what these results mean in plain language. Be concise but informative. Focus on highlighting key insights or patterns:
"""

    stuff_to_send = {
      "model": MODEL_NAME,
      "messages": [
        {"role": "user", "content": prompt}
      ],
      "stream": False
    }
    
    res = requests.post(OLLAMA_API_URL, json=stuff_to_send)
    res.raise_for_status()
    data = res.json()
    explanation = data.get('message', {}).get('content', '').strip()
    
    return explanation
  except Exception as e:
    logger.exception(f"Error explaining results: {str(e)}")
    return "I can't generate an explanation for these results."
