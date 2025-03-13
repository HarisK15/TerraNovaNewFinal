"""
This file connects to the Ollama API to generate SQL and Pandas queries
based on natural language input from the user. This is the main 'AI' part
of my dissertation project.

TODO: Improve error handling
TODO: Add support for more advanced query types
TODO: Make the prompts more robust
"""

# Ollama service for generating SQL and Pandas queries
# This file provides functions to call the Ollama API and generate various types of queries
# It handles formatting the prompts and parsing the responses

import os
import re
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Query types
QUERY_TYPE_SQL = 'sql'
QUERY_TYPE_PANDAS = 'pandas'

def generate_sql_query(user_query, schema_info):
    """
    Generate an SQL query using the Ollama API based on the natural language query and schema information.
    
    Args:
        user_query (str): The natural language query from the user
        schema_info (str): The schema information of the database
        
    Returns:
        dict: A dictionary with the generated SQL query and success status
    """
    model_name = os.getenv("OLLAMA_MODEL", "mistral:latest")
    print(f"🔍 Generating SQL query for: '{user_query}'")
    
    # Create the prompt for the SQL query generation
    prompt = f"""You are a highly intelligent AI assistant that converts natural language into SQL queries.

I have a database with the following schema:
{schema_info}

And this user query:
{user_query}

Generate a single, optimized SQL query that will answer this question. 
Respond ONLY with the SQL query, no explanation, markdown or anything else. Just the SQL query.

Examples:
- For "Show me all customers from New York", respond with: SELECT * FROM customers WHERE state = 'NY';
- For "Calculate total sales by region", respond with: SELECT region, SUM(amount) as total_sales FROM sales GROUP BY region;
- For "Find the top 5 products by revenue", respond with: SELECT product_name, SUM(price*quantity) as revenue FROM sales JOIN products ON sales.product_id = products.id GROUP BY product_name ORDER BY revenue DESC LIMIT 5;

YOUR RESPONSE (just SQL, nothing else):"""

    # Prepare the payload for Ollama API
    payload = {
        "model": model_name,
        "prompt": prompt,  # Use simple prompt parameter instead of messages array
        "temperature": 0.2,
        "stream": False
    }
    
    # Call the Ollama API
    try:
        print(f"🔄 Calling Ollama API with {len(prompt)} characters prompt")
        api_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")  # Use generate endpoint
        response = requests.post(api_url, json=payload, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Ollama API error: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"Ollama API error: {response.status_code}"
            }
        
        # Handle the response
        try:
            raw_text = response.text
            print(f"Raw response (first 100 chars): {raw_text[:100]}...")
            
            # Parse the JSON response
            response_data = json.loads(raw_text)
            
            # Extract the response content
            if "response" in response_data:
                sql_query = response_data["response"].strip()
                print(f"✅ Successfully extracted SQL query")
            else:
                print(f"⚠️ Unexpected response format: {response_data.keys()}")
                # Fallback extraction for other potential formats
                sql_query = response_data.get("output", response_data.get("text", "")).strip()
            
            # Clean up the SQL query - sometimes the model adds markdown formatting
            sql_query = sql_query.strip('`').strip()
            if sql_query.startswith('sql'):
                sql_query = sql_query[3:].strip()
                
            print(f"📊 Final SQL query: {sql_query}")
            
            # Basic validation - look for SQL keywords
            if not re.search(r'SELECT|COUNT|SUM|AVG|MIN|MAX|FROM|WHERE', sql_query, re.IGNORECASE):
                print(f"❌ Invalid SQL query format: {sql_query}")
                return {
                    "success": False,
                    "error": f"Invalid SQL query format: {sql_query}"
                }
            
            return {
                "success": True,
                "sql_query": sql_query,
                "query_type": "sql"
            }
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {str(e)}")
            # Direct text extraction fallback
            sql_pattern = re.search(r'SELECT|COUNT|FROM|WHERE', raw_text, re.IGNORECASE)
            if sql_pattern:
                # Find the start of the SQL
                start_pos = sql_pattern.start()
                # Find the end of the statement (semicolon or end of text)
                semi_pos = raw_text.find(';', start_pos)
                if semi_pos == -1:
                    semi_pos = len(raw_text)
                else:
                    semi_pos += 1  # Include the semicolon
                
                sql_query = raw_text[start_pos:semi_pos].strip()
                print(f"✅ Extracted SQL code directly: {sql_query}")
                return {
                    "success": True,
                    "sql_query": sql_query,
                    "query_type": "sql"
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to extract SQL query from response: {str(e)}"
                }
                
    except Exception as e:
        print(f"❌ Error calling Ollama API: {str(e)}")
        return {
            "success": False,
            "error": f"Error calling Ollama API: {str(e)}"
        }

def generate_pandas_query(user_query, schema_info):
    """
    Generate a pandas query using the Ollama API based on a natural language query and DataFrame schema.
    
    Args:
        user_query (str): The natural language query from the user
        schema_info (str): Information about the DataFrame schema
        
    Returns:
        dict: A dictionary with the generated pandas query and success status
    """
    model_name = os.getenv("OLLAMA_MODEL", "mistral:latest")
    print(f"🔍 Generating Pandas query for: '{user_query}'")
    
    # Check for export intent in the query
    export_intent = detect_export_intent(user_query)
    
    # Parse available columns from schema
    available_columns = []
    for line in schema_info.split('\n'):
        if ':' in line:
            col_name = line.split(':')[0].strip()
            available_columns.append(col_name.lower())
    
    print(f"✅ Available columns in schema: {available_columns}")
    
    # Check if the query is asking for specific columns
    query_lower = user_query.lower()
    mentioned_columns = []
    
    # Look for mentions of columns in the query
    for col in available_columns:
        if col in query_lower:
            mentioned_columns.append(col)
    
    if mentioned_columns:
        print(f"✅ Found columns mentioned in query: {mentioned_columns}")
    
    # Create the prompt for pandas query generation
    prompt = f"""You are a Python data expert. Given the following DataFrame schema information:

{schema_info}

And this user query:
{user_query}

Write a SINGLE line of pandas code that answers the query. The DataFrame is already loaded as 'df'.
Respond ONLY with the pandas code, no explanation, markdown or anything else. Just the code.

Examples:
- For "Show all rows where age > 30", respond with: df[df['Age'] > 30]
- For "Calculate average salary by department", respond with: df.groupby('Department')['Salary'].mean()
- For "Find top 5 highest paid employees", respond with: df.nlargest(5, 'Salary')
- For "Show count of employees by department", respond with: df['Department'].value_counts()
- For "What is the maximum salary", respond with: df['Salary'].max()

YOUR RESPONSE (just code, nothing else):"""

    # Prepare the payload for Ollama API
    payload = {
        "model": model_name,
        "prompt": prompt,  # Use simple prompt parameter instead of messages array
        "temperature": 0.2,
        "stream": False
    }
    
    # Call the Ollama API
    try:
        print(f"🔄 Calling Ollama API with {len(prompt)} characters prompt")
        api_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
        response = requests.post(api_url, json=payload, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Ollama API error: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"Ollama API error: {response.status_code}"
            }
        
        # Handle the response
        try:
            raw_text = response.text
            print(f"Raw response (first 100 chars): {raw_text[:100]}...")
            
            # Parse the JSON response
            response_data = json.loads(raw_text)
            
            # Extract the response content
            if "response" in response_data:
                pandas_query = response_data["response"].strip()
                print(f"✅ Successfully extracted pandas query")
            else:
                print(f"⚠️ Unexpected response format: {response_data.keys()}")
                # Fallback extraction for other potential formats
                pandas_query = response_data.get("output", response_data.get("text", "")).strip()
            
            # Clean up the pandas query
            pandas_query = pandas_query.strip('`').strip()
            if pandas_query.startswith('python'):
                pandas_query = pandas_query[6:].strip()
                
            print(f"📊 Final pandas query: {pandas_query}")
            
            # Basic validation - check if it starts with df
            if not (pandas_query.startswith('df.') or pandas_query.startswith('df[') or 
                    pandas_query.startswith('len(df') or pandas_query.startswith('df.shape')):
                print(f"❌ Invalid pandas query format: {pandas_query}")
                return {
                    "success": False,
                    "error": f"Invalid pandas query format: {pandas_query}"
                }
            
            return {
                "success": True,
                "pandas_query": pandas_query,
                "query_type": "pandas",
                "export_intent": export_intent if export_intent.get("is_export", False) else None
            }
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {str(e)}")
            # Direct text extraction fallback
            code_pattern = re.search(r'df\.[a-zA-Z_]+|df\[|len\(df', raw_text)
            if code_pattern:
                # Find the start of the code
                start_pos = code_pattern.start()
                # Find the end of the line or statement
                newline_pos = raw_text.find('\n', start_pos)
                if newline_pos == -1:
                    newline_pos = len(raw_text)
                
                pandas_query = raw_text[start_pos:newline_pos].strip()
                print(f"✅ Extracted pandas code directly: {pandas_query}")
                return {
                    "success": True,
                    "pandas_query": pandas_query,
                    "query_type": "pandas",
                    "export_intent": export_intent if export_intent.get("is_export", False) else None
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to extract pandas query from response: {str(e)}"
                }
                
    except Exception as e:
        print(f"❌ Error calling Ollama API: {str(e)}")
        return {
            "success": False,
            "error": f"Error calling Ollama API: {str(e)}"
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

def explain_query_results(query_text, query_code, results_summary):
    """
    Generate an explanation of the query results using the Ollama API.
    
    Args:
        query_text (str): The original natural language query
        query_code (str): The SQL or Pandas code that was executed
        results_summary (str): A summary of the query results
        
    Returns:
        dict: A dictionary with the explanation and success status
    """
    model_name = os.getenv("OLLAMA_MODEL", "mistral:latest")
    
    # Create the prompt for explanation generation
    prompt = f"""You are an expert data analyst that explains query results in clear, simple language.

Original query: "{query_text}"

Code that was executed: 
{query_code}

Query results:
{results_summary}

Please provide a clear, concise explanation of what these results mean. Use simple language and relate the explanation directly to the original query. Keep your response between 2-4 sentences."""

    # Prepare the payload for Ollama API
    payload = {
        "model": model_name,
        "prompt": prompt,  # Use simple prompt parameter instead of messages array
        "temperature": 0.2,
        "stream": False
    }
    
    try:
        print(f"🔄 Calling Ollama API with {len(prompt)} characters prompt")
        api_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
        response = requests.post(api_url, json=payload, timeout=30)
        
        if response.status_code != 200:
            print(f"❌ Ollama API error: {response.status_code} - {response.text}")
            return {
                "success": False,
                "error": f"Ollama API error: {response.status_code}"
            }
        
        # Handle the response
        try:
            raw_text = response.text
            print(f"Raw response (first 100 chars): {raw_text[:100]}...")
            
            # Parse the JSON response
            response_data = json.loads(raw_text)
            
            # Extract the response content
            if "response" in response_data:
                explanation = response_data["response"].strip()
                print(f"✅ Successfully extracted explanation")
            else:
                print(f"⚠️ Unexpected response format: {response_data.keys()}")
                # Fallback extraction for other potential formats
                explanation = response_data.get("output", response_data.get("text", "")).strip()
            
            # Clean up the explanation
            explanation = explanation.strip('`').strip()
            
            print(f"📝 Final explanation (first 100 chars): {explanation[:100]}...")
            
            return {
                "success": True,
                "explanation": explanation
            }
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {str(e)}")
            # For explanation, we can be more lenient and just use the raw response
            explanation = raw_text.strip('`').strip()
            print(f"⚠️ Using raw response as explanation: {explanation[:100]}...")
            
            return {
                "success": True,
                "explanation": explanation
            }
                
    except Exception as e:
        print(f"❌ Error calling Ollama API: {str(e)}")
        return {
            "success": False,
            "error": f"Error calling Ollama API: {str(e)}"
        }
