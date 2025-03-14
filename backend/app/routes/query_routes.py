# 📌 Handles queries from the frontend. Calls Ollama AI, processes responses, and returns results.
#
# ✅ Features to Implement:
# 	•	Accept user query as JSON request
# 	•	Call AI model to generate SQL/Pandas query
# 	•	Execute the AI-generated query on the dataset
# 	•	Return formatted results to React

import os
from flask import Blueprint, request, jsonify
from app.services.ollama_service import generate_sql_query, generate_pandas_query, explain_query_results, detect_export_intent, QUERY_TYPE_PANDAS
from app.utils.db_handler import get_database_schema, format_schema_for_prompt, execute_query, execute_pandas_query, format_results
from app.utils.shared_state import shared_state

query_routes = Blueprint("query_routes", __name__, url_prefix="/")

# Initialize with shared state
print(f"Query routes initializing. Current shared state: {shared_state.__dict__}")

@query_routes.route("/active-file", methods=["GET"])
def get_active_file():
    """Return the currently active file and its schema"""
    file_path = shared_state.active_file
    
    if not file_path or not os.path.exists(file_path):
        return jsonify({
            "success": False,
            "error": "No active file found"
        }), 404
    
    # Extract schema information
    schema = get_database_schema(file_path)
    
    return jsonify({
        "success": True,
        "file": os.path.basename(file_path),
        "schema": schema
    }), 200

@query_routes.route("/set-active-file", methods=["POST"])
def set_active_file():
    """Set the currently active file for queries"""
    data = request.json
    file_path = data.get("filePath")
    
    if not file_path:
        return jsonify({"error": "No file path provided"}), 400
    
    # Check if path is relative to the uploads directory
    if not os.path.isabs(file_path):
        # Try to resolve relative to backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        absolute_path = os.path.join(backend_dir, file_path)
    else:
        absolute_path = file_path
    
    print(f"Looking for file at: {absolute_path}")
    
    # Verify file exists
    if not os.path.exists(absolute_path):
        return jsonify({"error": f"File not found: {absolute_path}"}), 404
    
    # Update shared state
    shared_state.active_file = absolute_path
    print(f"Active file set to: {shared_state.active_file}")
    
    # Extract and return schema information
    schema = get_database_schema(absolute_path)
    
    return jsonify({
        "success": True,
        "message": f"Active file set to {os.path.basename(file_path)}",
        "schema": schema
    }), 200

@query_routes.route("/query", methods=["POST"])
def process_query():
    """Process a natural language query using Ollama and execute it against the active file"""
    data = request.json
    user_query = data.get("query")
    file_path = data.get("filePath", shared_state.active_file)
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400
    
    if not file_path:
        return jsonify({"error": "No active file. Please upload a file first."}), 400
        
    # Make sure file_path is a string
    if isinstance(file_path, dict):
        # If file_path is a dictionary, extract the path value
        print(f"Warning: file_path is a dictionary: {file_path}")
        if "path" in file_path:
            file_path = file_path["path"]
        else:
            return jsonify({"error": "Invalid file path format"}), 400
            
    # Fix the path to ensure we don't have duplicate 'backend' directory issues
    # Get absolute path without backend prefix duplication
    if isinstance(file_path, str) and file_path.startswith('backend/'):
        file_path = file_path[8:]  # Remove 'backend/' prefix
        
    # Ensure the path is relative to the current directory
    if isinstance(file_path, str):
        file_path = os.path.join(os.getcwd(), file_path)
    print(f"✅ DEBUG: Adjusted file path: {file_path}")
        
    # Get schema information from the file
    schema = get_database_schema(file_path)
    if "error" in schema:
        return jsonify({"error": schema["error"]}), 400
    
    # Format schema for the AI prompt
    schema_info = format_schema_for_prompt(schema)
    
    # Add debug logging for schema information
    print(f"✅ DEBUG: Schema information provided to LLM:\n{schema_info}")
    
    # Determine file type for choosing the appropriate query generation method
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.csv':
        # For CSV files, use Pandas query generation
        query_result = generate_pandas_query(user_query, schema_info)
        
        if not query_result.get("success", False):
            # Fall back to SQL query if Pandas query generation fails
            print("⚠️ Pandas query generation failed, falling back to SQL.")
            query_result = generate_sql_query(user_query, schema_info)
            
    else:
        # For SQLite databases, use SQL query generation
        query_result = generate_sql_query(user_query, schema_info)
    
    if not query_result.get("success", False):
        return jsonify({
            "success": False,
            "error": query_result.get("error", "Failed to generate query")
        }), 500
    
    # Determine query type and execute accordingly
    query_type = query_result.get("query_type")
    
    if query_type == "pandas":
        # Extract and execute the generated Pandas query
        pandas_query = query_result.get("pandas_query")
        exec_results = execute_pandas_query(file_path, pandas_query)
        query_code = pandas_query  # Store for response
        
        # Check if this was an export intent
        export_intent = detect_export_intent(user_query)
    else:
        # Extract and execute the generated SQL query
        sql_query = query_result.get("sql_query")
        exec_results = execute_query(file_path, sql_query)
        query_code = sql_query  # Store for response
        export_intent = {"is_export": False}
    
    if not exec_results.get("success", False):
        return jsonify({
            "success": False,
            "error": exec_results.get("error", "Failed to execute query"),
            "query_type": query_type,
            "query_code": query_code  # Include the query for debugging
        }), 500
    
    # Skip explanation generation - user prefers just the data
    
    # Debug logging for export requests
    if query_type == "pandas" and export_intent.get("is_export"):
        print(f"✅ DEBUG: Returning export data for frontend:")
        print(f"✅ DEBUG: Export intent: {export_intent}")
        print(f"✅ DEBUG: Results shape: {len(exec_results.get('results', []))} rows")
        print(f"✅ DEBUG: Columns: {exec_results.get('columns', [])}")
        print(f"✅ DEBUG: First few results: {exec_results.get('results', [])[:3]}")
    
    return jsonify({
        "success": True,
        "query_type": query_type,
        "query_code": query_code,
        "results": exec_results.get("results"),
        "columns": exec_results.get("columns"),
        "export_intent": export_intent if query_type == "pandas" and export_intent.get("is_export") else None,
        # Include detected format and template type for the frontend
        "export_format": export_intent.get("format") if query_type == "pandas" and export_intent.get("is_export") else None,
        "export_template_type": export_intent.get("template_type") if query_type == "pandas" and export_intent.get("is_export") else None,
        # No explanation included in the response
    }), 200
