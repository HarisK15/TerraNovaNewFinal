import os
import sys  
from flask import Blueprint, request, jsonify
import logging
from app.services.ollama_service import get_sql_query, get_pandas_query, explain_query_results, QUERY_TYPE_PANDAS
from app.utils.db_handler import get_database_schema, execute_query, execute_pandas_query, format_results, get_enhanced_schema_with_samples
from app.utils.rag_examples import guess_relevant_files
import numpy as np  

logging.basicConfig(
    level=logging.DEBUG,  
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

query_bp = Blueprint("query_bp", __name__, url_prefix="/")
active_filepath = None

@query_bp.route("/active-file", methods=["GET"])
def get_active_file():
    global active_filepath
    if not active_filepath:
        print("No active file")
        return jsonify({
            "success": False,
            "error": "File not found"
        }), 404
    schema = get_database_schema(active_filepath)
    return jsonify({
        "success": True,
        "file": os.path.basename(active_filepath),
        "schema": schema
    }), 200

# @query_bp.route("/debug", methods=["GET"])
# def debug_info():
#     return jsonify({"active_file": active_file_path})

@query_bp.route("/set-active-file", methods=["POST"])
def set_active_file():
    # todo: refactor this to use sharedstate instead 
    data = request.json
    filepath = data.get("filePath")
    if not filepath:
        return jsonify({"error": "No file path provided"}), 400
    
    if not os.path.isabs(filepath):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        full_path = os.path.join(backend_dir, filepath)
    else:
        full_path = filepath
        
    global active_filepath
    active_filepath = full_path
    
    return jsonify({
        "success": True,
        "message": f"Active file set to {os.path.basename(full_path)}"
    }), 200

@query_bp.route("/query", methods=["POST"])
def handle_query():
    data = request.json
    user_query = data.get("query")
    filepath = data.get("filePath", active_filepath)
    if not user_query:
        print("User query is missing!") 
        return jsonify({"error": "Query required"}), 400
        
    if not filepath:
        return jsonify({"error": "No file path provided"}), 400
    
    # kept getting backend prefix duplication errors
    if filepath.startswith(os.path.join("backend", "")):
        filepath = filepath[len("backend/"):]

    filepath = os.path.join(os.getcwd(), filepath)
    logger.debug(f"using file: {filepath}")
    
    # RAG
    schema = get_enhanced_schema_with_samples(filepath)
    if isinstance(schema, dict) and "error" in schema:
        print(f"Error in schema: {schema['error']}")
        return jsonify({"error": schema["error"]}), 400
    
    print("Enhanced schema with samples prepared for RAG...")
    
    file_extension = os.path.splitext(filepath)[1].lower() 
    
    if file_extension == '.csv':
        # Pass the file to enable RAG functionality
        query_result = get_pandas_query(user_query, schema, filepath)
        if not query_result.get("success", False):
            logger.warning("Pandas failed, using SQL now")
            query_result = get_sql_query(user_query, schema, filepath)    
    else:
        query_result = get_sql_query(user_query, schema, filepath)
    
    if not query_result.get("success", False):
        return jsonify({
            "success": False,
            "error": query_result.get("error", "Failed to generate query")
        }), 500
    query_type = query_result.get("query_type")
    
    if query_type == "pandas":
        pandas_query = query_result.get("pandas_query")
        query_results = execute_pandas_query(filepath, pandas_query)
        generated_code = pandas_query 
    else:
        sql_query = query_result.get("sql_query")
        print(f"Running SQL: {sql_query}")
        query_results = execute_query(filepath, sql_query)
        generated_code = sql_query 
    
    if not query_results.get("success", False):
        return jsonify({
            "success": False,
            "error": query_results.get("error", "Unknown error occurred"),
            "query_type": query_type,
            "generated_code": generated_code 
        }), 500
    
    # Generate natural language explanation for results
    explanation = explain_query_results(query_results, user_query)
    
    response_data = {
        "success": True,
        "query_type": query_type,
        "generated_code": generated_code,
        "results": query_results.get("results"),
        "columns": query_results.get("columns"),
        "explanation": explanation
    }
    
    return jsonify(response_data), 200