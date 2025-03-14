# 📌 Connects to Ollama LLM (running locally or on a server).
# 🔗 Connected to:
# 	•	query_routes.py (Receives user queries, sends them to Ollama)
#
# ✅ Features to Implement:
# 	•	Send user query to Ollama API (http://localhost:11434)
# 	•	Receive AI-generated SQL/Pandas query from Ollama
# 	•	Return AI-generated query back to Flask API

import requests
import json
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the Ollama API URL from environment variables or use default
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434/api/chat')
MODEL_NAME = os.getenv('MODEL_NAME', 'llama3')

# Query types
QUERY_TYPE_SQL = 'sql'
QUERY_TYPE_PANDAS = 'pandas'

def generate_sql_query(user_query, schema_info):
    """
    Generate a SQL query using Ollama's API based on a natural language query and database schema.
    
    Args:
        user_query (str): The natural language query from the user
        schema_info (str): Information about the database schema (tables, columns, etc.)
        
    Returns:
        dict: Contains the generated SQL query and any additional information
    """
    # Create a prompt that instructs the model to generate SQL
    prompt = f"""You are a helpful SQL assistant. Given the following database schema information:

{schema_info}

IMPORTANT: When generating SQL queries, please follow these guidelines:
1. Match string values EXACTLY as shown in the examples. Do not abbreviate or modify city names or other string values.
2. Pay close attention to the full names in the database (e.g., 'New York City' should be matched as 'New York City', not just 'New York').
3. Use the EXACT column names as provided in the schema - never abbreviate or modify them.
4. Remember that SQL is case-sensitive for string comparisons.
5. CRITICAL: For CSV files, ALWAYS use 'data' as the table name in your SQL query, regardless of the filename.
6. For state or location queries (like 'GO', 'CA', 'NY'), check column names carefully - look for fields like 'state', 'state_code', 'location', 'region', etc.
7. When filtering by state codes or abbreviations, use UPPER or LOWER functions to handle case sensitivity issues, e.g., WHERE UPPER(state) = 'GO' OR WHERE LOWER(state) = 'go'
8. When using aggregate functions like COUNT(), SUM(), AVG(), always include a GROUP BY clause for any non-aggregated columns.
9. For popularity queries (most/least popular), always group by the item in question, then count occurrences, e.g., SELECT product_name, COUNT(*) AS count FROM data GROUP BY product_name ORDER BY count DESC LIMIT 1
10. For SQLite queries, ensure proper handling of aggregate functions with GROUP BY and avoid using COUNT(*) in ORDER BY without proper grouping.

Generate a valid SQL query to answer this question: "{user_query}"

Return ONLY the SQL query without any explanation or markdown formatting.
"""
    
    # Prepare the payload for Ollama API
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }
    
    try:
        # Make the API call to Ollama
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the response
        result = response.json()
        
        # Extract the generated SQL query from the chat API response
        sql_query = result.get('message', {}).get('content', '').strip()
            
        return {
            "success": True,
            "query_type": QUERY_TYPE_SQL,
            "sql_query": sql_query
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate SQL query"
        }

def generate_pandas_query(user_query, schema_info):
    """
    Generate a Pandas query using Ollama's API based on a natural language query and CSV schema.
    This provides an alternative to SQL for CSV files, using Pandas' powerful data manipulation capabilities.
    
    Args:
        user_query (str): The natural language query from the user
        schema_info (str): Information about the CSV schema (columns, data types, etc.)
        
    Returns:
        dict: Contains the generated Pandas query code and any additional information
    """
    export_intent = detect_export_intent(user_query)
    
    # Get all available columns from the schema
    available_columns = []
    if "Database Schema:" in schema_info:
        # Extract column information from the schema
        schema_lines = schema_info.split('\n')
        for line in schema_lines:
            if "Columns:" in line:
                columns_part = line.split("Columns:")[1].strip()
                available_columns = [col.strip() for col in columns_part.split(',')]
    
    print(f"✅ Available columns: {available_columns}")
    
    # Handle export intents more reliably
    if export_intent.get("is_export", False):
        # For export queries, we'll directly generate a safe column selection
        # instead of relying on the LLM, which might produce incorrect column names
        
        # Make sure we have a mapped_columns field
        if "mapped_columns" not in export_intent and "columns" in export_intent:
            # Copy columns to mapped_columns for consistency
            export_intent["mapped_columns"] = export_intent["columns"]
        elif "mapped_columns" not in export_intent:
            export_intent["mapped_columns"] = []
        
        # If no columns were specified or mapped, use all available columns
        if not export_intent["mapped_columns"]:
            export_intent["mapped_columns"] = available_columns
            
        # Remove duplicates in mapped columns while preserving order
        unique_columns = []
        for col in export_intent["mapped_columns"]:
            if col not in unique_columns:
                unique_columns.append(col)
        
        export_intent["mapped_columns"] = unique_columns
        
        # If no columns were found or mapped, use all available columns
        if not export_intent["mapped_columns"]:
            export_intent["mapped_columns"] = available_columns
            
        column_list = ", ".join([f"'{col}'" for col in export_intent["mapped_columns"]])
        
        # Build a safe export query that only includes existing columns
        # This query will select only the requested columns that exist in the dataframe
        if export_intent["mapped_columns"]:
            # Only include columns that exist in the dataframe
            pandas_query = f"df[[col for col in [{column_list}] if col in df.columns]]"
            # Add debug print to help troubleshoot
            print(f"✅ DEBUG: Export query with columns: {export_intent['mapped_columns']}")
        else:
            # Fallback to all columns if no specific columns are requested
            pandas_query = "df"
            print("✅ DEBUG: Export query with all columns (no specific columns requested)")
        
        # Skip the LLM call for simple export queries to ensure reliability
        return {
            "success": True,
            "pandas_query": pandas_query,
            "query_type": QUERY_TYPE_PANDAS,
            "export_intent": export_intent
        }
    
    # For non-export queries, continue with the normal LLM generation process
    # Create a prompt that instructs the model to generate Pandas code
    prompt = f"""You are a helpful Python data analysis assistant. Given the following CSV file schema information:

{schema_info}

IMPORTANT: When generating Pandas queries, please follow these guidelines:
1. Assume the CSV data is already loaded into a Pandas DataFrame named 'df'.
2. Match string values EXACTLY as shown in the examples.
3. Use the EXACT column names as provided in the schema - never abbreviate or modify them.
4. For filtering operations, use appropriate Pandas methods (df.loc, df.query, etc.).
5. For aggregation queries, use groupby(), agg(), etc. appropriately.
6. For state or location queries (like 'GO', 'CA', 'NY'), use case-insensitive comparison when appropriate.
7. For popularity or frequency analysis, use value_counts() or groupby() with size() or count().
8. Return only the necessary columns in the result.
9. Limit the number of results when appropriate (e.g., using .head(N) for top N queries).
10. Use proper Pandas syntax and best practices.
11. IMPORTANT: Your code should be a SINGLE EXPRESSION that returns a DataFrame or Series. Do not write multiple statements.
12. DO NOT include any print statements in your code, just return the final DataFrame.
13. Keep imports, explanations, or other code out of your answer - ONLY the data manipulation expression.
14. When creating frequency counts, use this exact pattern for every data analysis task:
    df['column_name'].value_counts().reset_index().rename(columns={{'index': 'column_display_name', 'column_name': 'count'}}).head(N)
15. NEVER use duplicate column names in your result - ensure each column has a unique name.
16. For export requests, filter and select ONLY the requested columns. Ensure the requested columns exist in the DataFrame.
"""
    
    if export_intent.get("is_export", False):
        # Add specific instructions for export queries
        column_list = ", ".join([f"'{col}'" for col in export_intent["mapped_columns"]])
        prompt += f"\n\nThis query is an EXPORT request. Generate code that selects these columns: [{column_list}]\n"
        prompt += f"Your export code MUST check if each column exists before selecting it. Only select columns that exist in the dataframe.\n"
        prompt += f"For example, use: df[[col for col in [{column_list}] if col in df.columns]]\n"
    
    prompt += f"\nGenerate ONLY a single valid Python/Pandas expression to answer this question: \"{user_query}\"\n"
    prompt += "\nReturn ONLY the final expression without any explanation, comments or markdown formatting."
    
    if export_intent.get("is_export", False):
        prompt += f"\n\nExport Intent Detected: {export_intent.get('format', '')} format, template type: {export_intent.get('template_type', '')}, requested columns: {export_intent.get('columns', [])}, mapped columns: {export_intent.get('mapped_columns', [])}"
    
    # Prepare the payload for Ollama API
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }
    
    try:
        # Make the API call to Ollama
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the response
        result = response.json()
        
        # Extract the generated Pandas query from the chat API response
        pandas_query = result.get('message', {}).get('content', '').strip()
        
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

def detect_export_intent(user_query):
    """
    Detect if the user's query is asking for an export operation
    
    Args:
        user_query (str): The natural language query from the user
        
    Returns:
        dict: Contains export intent and format information
    """
    user_query_lower = user_query.lower()
    
    # Check for export intent keywords
    export_keywords = ["export", "download", "save", "extract", "output", "create"]
    has_export_intent = any(keyword in user_query_lower for keyword in export_keywords)
    
    if not has_export_intent:
        return {"is_export": False}
    
    # Detect format
    formats = {
        "csv": ["csv", "comma separated"],
        "excel": ["excel", "xlsx", "spreadsheet", "report"],
        "json": ["json", "javascript object"]
    }
    
    detected_format = None
    for format_name, format_keywords in formats.items():
        if any(keyword in user_query_lower for keyword in format_keywords):
            detected_format = format_name
            break
    
    # Detect template type based on query content
    template_type = "basic"
    if "report" in user_query_lower or "summary" in user_query_lower:
        template_type = "report"
    elif "nested" in user_query_lower or "metadata" in user_query_lower:
        template_type = "nested"
    
    # Extract potential column names using a more direct approach
    # First, handle some common column prefixes in the dataset
    common_prefixes = [
        # Customer related
        "customer_", "order_", "product_", "seller_", "item_"
    ]
    
    # Extract possible column references
    potential_columns = []
    
    # Look for more specific column references with column name pattern matching
    # This regex finds potential column names in the query
    col_pattern = r'(customer_\w+|order_\w+|product_\w+|seller_\w+|item_\w+)'
    col_matches = re.findall(col_pattern, user_query_lower)
    potential_columns.extend(col_matches)
    
    # Handle the case where the user mentions specific columns without prefixes
    # by checking for words like "id", "state", "city", etc.
    column_keywords = ["id", "state", "city", "zip", "code", "prefix", "name", "price", "amount"]
    for keyword in column_keywords:
        if keyword in user_query_lower and not any(f"_{keyword}" in col for col in potential_columns):
            # Check if it's preceded by a common entity type
            for prefix in ["customer", "order", "product", "seller", "item"]:
                if prefix in user_query_lower and f"{prefix}_{keyword}" not in potential_columns:
                    potential_columns.append(f"{prefix}_{keyword}")
    
    # If the query mentions specific columns, use those
    # Otherwise default to all available columns later in processing
    identified_columns = []
    if potential_columns:
        # Try to get the most specific columns first
        for col in potential_columns:
            # Remove any trailing punctuation
            clean_col = col.rstrip('.,;:!?')
            identified_columns.append(clean_col)
    
    # Create a unique list of detected column names sorted by length (longer first)
    columns = list(set(identified_columns))
    columns.sort(key=len, reverse=True)
    
    # Create export intent object with enhanced format and template info
    export_intent = {
        "is_export": True,
        "format": detected_format,
        "template_type": template_type,
        "columns": columns,
        "mapped_columns": []  # Initialize empty, will be populated later
    }
    
    return export_intent

def explain_query_results(results, user_query):
    """
    Generate a natural language explanation of the query results.
    
    Args:
        results (str): The results of the SQL query in a formatted string
        user_query (str): The original natural language query from the user
        
    Returns:
        dict: Contains the generated explanation
    """
    prompt = f"""Based on the following query results for the question "{user_query}":

{results}

Provide a clear, concise explanation of what these results mean in plain English. Focus only on the key insights, facts, and patterns within the data. Keep your response direct, factual, and avoid showing your thinking process or mentioning the SQL query. Make it sound like a direct answer to the user's question in a conversational tone, under 3-4 sentences if possible.
"""
    
    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        
        result = response.json()
        explanation = result.get('message', {}).get('content', '').strip()
        
        return {
            "success": True,
            "explanation": explanation
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate explanation"
        }
        
        result = response.json()
        explanation = result.get('message', {}).get('content', '').strip()
        
        return explanation
        
    except Exception as e:
        print(f"Error generating explanation: {str(e)}")
        # Provide a fallback explanation to ensure we don't break the UI
        return f"Here are the results for your query: '{user_query}'"
