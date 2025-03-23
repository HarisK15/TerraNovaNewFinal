import os
from flask import Blueprint, request, jsonify
from app.services.ollama_service import generate_sql_query, generate_pandas_query, explain_query_results, detect_export_intent, QUERY_TYPE_PANDAS
from app.utils.db_handler import get_database_schema, format_schema_for_prompt, execute_query, execute_pandas_query, format_results
import logging

# todo: Add logging when pushing
# todo: Fix file path bug when running on Windows

logging.basicConfig(
    level=logging.DEBUG,  
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


query_bp = Blueprint("query_bp", __name__, url_prefix="/")

# file stored globally so it can be used by other routes
current_file_path = None

@query_bp.route("/active-file", methods=["GET"])
def get_active_file():
    global current_file_path
    if not current_file_path or not os.path.exists(current_file_path):
        return jsonify({
            "success": False,
            "error": "File not found"
        }), 404
    #schema info extracted
    schema = get_database_schema(current_file_path)
    return jsonify({
        "success": True,
        "file": os.path.basename(current_file_path),
        "schema": schema
    }), 200

@query_bp.route("/set-active-file", methods=["POST"])
def set_active_file():
    data = request.json
    file_path = data.get("filePath")
    if not file_path:
        return jsonify({"success": False, "error": "No file path provided"}), 400
    if file_path.strip() == "":
        return jsonify({"success": False, "error": "File path cannot be empty"}), 400
    if not os.path.isabs(file_path):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        absolute_path = os.path.join(backend_dir, file_path)
    else:
        absolute_path = file_path
    if not os.path.exists(absolute_path):
        return jsonify({"error": f"File not found: {absolute_path}"}), 404
    global current_file_path
    current_file_path = absolute_path
    # extract schema
    schema = get_database_schema(absolute_path)
    
    return jsonify({
        "success": True,
        "message": f"Active file set to {os.path.basename(file_path)}",
        "schema": schema
    }), 200

@query_bp.route("/query", methods=["POST"])
def process_query():
    data = request.json
    user_query = data.get("query")
    file_path = data.get("filePath", current_file_path)
    if not user_query:
        print("User query is missing!") 
        return jsonify({"success": False, "error": "Query required"}), 400
    if not file_path:
        return jsonify({"success": False, "error": "No file path provided"}), 400
    if file_path.strip() == "":
        return jsonify({"success": False, "error": "File path cannot be empty"}), 400
    # Get absolute path without backend prefix duplication
    if file_path.startswith(os.path.join("backend", "")):
        file_path = file_path[len("backend/"):]

    file_path = os.path.join(os.getcwd(), file_path)
    logger.debug(f"Checking file path after adjustments: {file_path}")
    schema = get_database_schema(file_path)
    if "error" in schema:
        return jsonify({"error": schema["error"]}), 400
    
    # Format schema for the AI prompt
    schema_info = format_schema_for_prompt(schema)
    try:
        logger.debug("Schema information sent to LLM: \n" + str(schema_info))
    except Exception as e:
        logger.error(f"Error logging schema info: {e}")


    # Determine file type
    file_extension = os.path.splitext(file_path)[1].lower() 
    if file_extension == '.csv':
        # For CSV files, use Pandas query generation
        query_result = generate_pandas_query(user_query, schema_info)
        
        if not query_result.get("success", False):
            logger.warning("Pandas query generation failed, using now  SQL.")
            query_result = generate_sql_query(user_query, schema_info)    
    else:
        query_result = generate_sql_query(user_query, schema_info)
    
    # model gives weird responses sometimes breaking this 
    if not query_result.get("success", False):
        return jsonify({
            "success": False,
            "error": query_result.get("error", "Failed to generate query")
        }), 500
    
    # Determine query type and execute accordingly
    query_type = query_result.get("query_type")
    
    if query_type == "pandas":
        pandas_query = query_result.get("pandas_query")
        exec_results = execute_pandas_query(file_path, pandas_query)
        query_code = pandas_query 
        export_intent = detect_export_intent(user_query)
    else:
        sql_query = query_result.get("sql_query")
        exec_results = execute_query(file_path, sql_query)
        query_code = sql_query 
        export_intent = {"is_export": False}
    
    if not exec_results.get("success", False):
        return jsonify({
            "success": False,
            "error": exec_results.get("error", "Failed to execute query"),
            "query_type": query_type,
            "query_code": query_code 
        }), 500
    
    
    # Prepare the response data
    response_data = {
        "success": True,
        "query_type": query_type,
        "query_code": query_code,
        "results": exec_results.get("results"),
        "columns": exec_results.get("columns"),
    }
    
    # Add export fields only if relevant
    if query_type == "pandas" and export_intent.get("is_export"):
        response_data.update({
            "export_intent": export_intent,
            "export_format": export_intent.get("format"),
            "export_template_type": export_intent.get("template_type")
        })
    return jsonify(response_data), 200