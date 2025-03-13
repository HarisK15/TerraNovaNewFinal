# This file handles queries to the database/CSV file
# It processes natural language queries, calls the AI model,
# and returns the results back to the frontend
# TODO: Add more error handling
# TODO: Add query history feature

import os
from flask import Blueprint, request, jsonify
from app.services.ollama_service import generate_sql_query, generate_pandas_query, explain_query_results, detect_export_intent
from app.utils.db_handler import get_database_schema, format_schema_for_prompt, execute_query, execute_pandas_query, format_results

print("Loading query_routes.py...")

# Create a blueprint for the API routes
query_routes = Blueprint("query_routes", __name__, url_prefix="/")

# Store the currently active file path in a global variable
# This is probably not the best way to do this, but it works for now
current_file_path = None
print(f"Initial current_file_path: {current_file_path}")

@query_routes.route("/active-file", methods=["GET"])
def get_active_file():
    """Return the currently active file and its schema"""
    print("GET /active-file endpoint called")
    
    global current_file_path
    
    # Check if we have an active file
    if not current_file_path or not os.path.exists(current_file_path):
        print(f"No active file found or file doesn't exist: {current_file_path}")
        return jsonify({
            "success": False,
            "error": "No active file found"
        }), 404
    
    # Get the schema information from the file
    print(f"Getting schema for active file: {current_file_path}")
    schema = get_database_schema(current_file_path)
    
    print(f"Returning active file info: {os.path.basename(current_file_path)}")
    return jsonify({
        "success": True,
        "file": os.path.basename(current_file_path),
        "schema": schema
    }), 200

@query_routes.route("/set-active-file", methods=["POST"])
def set_active_file():
    """Set the currently active file for queries"""
    print("POST /set-active-file endpoint called")
    
    # Get the file path from the request
    data = request.json
    file_path = data.get("filePath")
    
    if not file_path:
        print("No file path provided in request")
        return jsonify({"error": "No file path provided"}), 400
    
    print(f"Requested file path: {file_path}")
    
    # Check if path is relative or absolute
    if not os.path.isabs(file_path):
        # Convert to absolute path
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        absolute_path = os.path.join(backend_dir, file_path)
    else:
        absolute_path = file_path
    
    print(f"Looking for file at: {absolute_path}")
    
    # Make sure the file exists
    if not os.path.exists(absolute_path):
        print(f"File not found: {absolute_path}")
        return jsonify({"error": f"File not found: {absolute_path}"}), 404
    
    # Update the global variable with the new file path
    global current_file_path
    current_file_path = absolute_path
    print(f"Active file set to: {current_file_path}")
    
    # Get the schema information from the file
    print(f"Getting schema for new active file")
    schema = get_database_schema(absolute_path)
    
    return jsonify({
        "success": True,
        "message": f"Active file set to {os.path.basename(file_path)}",
        "schema": schema
    }), 200

@query_routes.route("/query", methods=["POST"])
def process_query():
    """Process a natural language query using Ollama and execute it against the active file"""
    print("POST /query endpoint called")
    
    # Get the query from the request
    data = request.json
    user_query = data.get("query")
    file_path = data.get("filePath", current_file_path)
    
    print(f"User query: '{user_query}'")
    print(f"Using file path: {file_path}")
    
    if not user_query:
        print("No query provided in request")
        return jsonify({"error": "No query provided"}), 400
    
    if not file_path:
        print("No active file. Please upload a file first.")
        return jsonify({"error": "No active file. Please upload a file first."}), 400
        
    # Fix the path to ensure we don't have duplicate 'backend' directory issues
    if file_path.startswith('backend/'):
        file_path = file_path[8:]  # Remove 'backend/' prefix
        print(f"Removed 'backend/' prefix from path: {file_path}")
        
    # Ensure the path is absolute
    file_path = os.path.join(os.getcwd(), file_path)
    print(f"Adjusted file path: {file_path}")
        
    # Get schema information from the file
    print("Getting database schema")
    schema = get_database_schema(file_path)
    if "error" in schema:
        print(f"Error getting schema: {schema['error']}")
        return jsonify({"error": schema["error"]}), 400
    
    # Format schema for the AI prompt
    schema_info = format_schema_for_prompt(schema)
    
    # Log schema information (truncated for readability)
    schema_preview = schema_info[:100] + "..." if len(schema_info) > 100 else schema_info
    print(f"Schema information: {schema_preview}")
    
    # Figure out whether to use SQL or Pandas based on file type
    file_extension = os.path.splitext(file_path)[1].lower()
    print(f"File extension: {file_extension}")
    
    if file_extension == '.csv':
        # For CSV files, use Pandas query generation
        print("CSV file detected, using Pandas query generation")
        query_result = generate_pandas_query(user_query, schema_info)
        
        if not query_result.get("success", False):
            # Fall back to SQL query if Pandas query generation fails
            print("Pandas query generation failed, falling back to SQL")
            query_result = generate_sql_query(user_query, schema_info)
            
    else:
        # For SQLite databases, use SQL query generation
        print("SQLite database detected, using SQL query generation")
        query_result = generate_sql_query(user_query, schema_info)
    
    if not query_result.get("success", False):
        print(f"Query generation failed: {query_result.get('error', 'Unknown error')}")
        return jsonify({
            "success": False,
            "error": query_result.get("error", "Failed to generate query")
        }), 500
    
    # Determine query type and execute accordingly
    query_type = query_result.get("query_type")
    print(f"Query type: {query_type}")
    
    if query_type == "pandas":
        # Extract and execute the generated Pandas query
        pandas_query = query_result.get("pandas_query")
        print(f"Executing Pandas query (length: {len(pandas_query)} chars)")
        print(f"First 100 chars of query: {pandas_query[:100]}...")
        
        exec_results = execute_pandas_query(file_path, pandas_query)
        query_code = pandas_query  # Store for response
        
        # Check if this was an export intent
        export_intent = detect_export_intent(user_query)
        print(f"Export intent: {export_intent}")
    else:
        # Extract and execute the generated SQL query
        sql_query = query_result.get("sql_query")
        print(f"Executing SQL query: {sql_query}")
        
        exec_results = execute_query(file_path, sql_query)
        query_code = sql_query  # Store for response
        export_intent = {"is_export": False}
    
    if not exec_results.get("success", False):
        print(f"Query execution failed: {exec_results.get('error', 'Unknown error')}")
        return jsonify({
            "success": False,
            "error": exec_results.get("error", "Failed to execute query"),
            "query_type": query_type,
            "query_code": query_code  # Include the query for debugging
        }), 500
    
    # Debug logging for export requests
    if query_type == "pandas" and export_intent.get("is_export"):
        print(f"Export data details:")
        print(f"- Results shape: {len(exec_results.get('results', []))} rows")
        print(f"- Columns: {exec_results.get('columns', [])}")
        print(f"- First few rows: {exec_results.get('results', [])[:2]}")
    
    return jsonify({
        "success": True,
        "query_type": query_type,
        "query_code": query_code,
        "results": exec_results.get("results"),
        "columns": exec_results.get("columns"),
        "export_intent": export_intent if query_type == "pandas" and export_intent.get("is_export") else None,
        # Include export format details for the frontend
        "export_format": export_intent.get("format") if query_type == "pandas" and export_intent.get("is_export") else None,
        "export_template_type": export_intent.get("template_type") if query_type == "pandas" and export_intent.get("is_export") else None,
    }), 200
