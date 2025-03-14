# This file handles uploading and managing files
# It allows the user to upload CSV and SQLite DB files and saves them to the uploads folder
# TODO: Add more validation for different file types
# TODO: Add error handling for large files

import os
from flask import Blueprint, request, jsonify, current_app
from app.utils.file_handler import save_file
from app.utils.shared_state import SharedState, shared_state  # Import both the class and singleton instance

# Create a blueprint for file routes
file_routes = Blueprint("file_routes", __name__, url_prefix="/")

# Print current state for debugging
print("File routes initializing. Current shared state:", shared_state.__dict__)

# Route for handling file uploads
@file_routes.route("/upload", methods=["POST", "GET"])
def upload_file():
    print(f"File upload endpoint called with method: {request.method}")
    
    # We only want POST requests for file uploads
    if request.method == "GET":
        print("Someone tried to GET the upload endpoint, not allowed")
        return jsonify({"message": "Use POST to upload files"}), 405
    
    # Check if a file was actually sent
    file = request.files.get("file")
    if not file:
        print("No file found in the request")
        return jsonify({"error": "No file uploaded"}), 400

    # Try to save the file using our file handler
    print(f"Received file: {file.filename}, attempting to save...")
    result = save_file(file)
    
    # Debug print the result
    print(f"Save file result: {result}")

    # If successful, automatically set this file as the active file
    if result.get("success", False):
        file_path = result.get("path")
        file_name = result.get("original_filename")
        file_extension = os.path.splitext(file_name)[1].lower()
        
        # Get schema info for the file
        schema = None
        file_type = ""
        
        try:
            if file_extension == '.csv':
                # Read first few lines of CSV to get column names
                import csv
                with open(file_path, 'r') as f:
                    reader = csv.reader(f)
                    header = next(reader)
                    schema = "\n".join([f"{col}: text" for col in header])
                    file_type = "csv"
                    
            elif file_extension == '.db':
                # Get basic SQLite table info
                import sqlite3
                conn = sqlite3.connect(file_path)
                cursor = conn.cursor()
                
                # Get list of tables
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = [table[0] for table in cursor.fetchall()]
                
                # Build schema info
                schema_info = []
                for table in tables:
                    cursor.execute(f"PRAGMA table_info({table});")
                    columns = cursor.fetchall()
                    schema_info.append(f"Table: {table}")
                    for col in columns:
                        schema_info.append(f"  {col[1]}: {col[2]}")
                
                schema = "\n".join(schema_info)
                file_type = "sqlite"
                conn.close()
                
            # Update the active file in shared state
            shared_state.active_file = {
                "name": os.path.basename(file_path),
                "path": file_path,
                "type": file_type,
                "schema": schema
            }
            
            print(f"Automatically set active file to: {file_path}")
            
            # Include the active file info in the response
            result["active_file"] = shared_state.active_file
            
        except Exception as e:
            print(f"Error setting uploaded file as active: {str(e)}")
            # Continue anyway - the file was uploaded successfully
    
    # Return the result to the frontend
    return jsonify(result), 200

# Alias route for compatibility
@file_routes.route("/api/upload", methods=["POST", "GET"])
def upload_file_alias():
    print("Upload file alias endpoint called - forwarding to upload_file")
    return upload_file()

# Set the active file for operations
@file_routes.route("/set-active-file", methods=["POST"])
def set_active_file():
    # Get file path from request
    data = request.json
    if not data or "filePath" not in data:
        print("No file path provided")
        return jsonify({"error": "No file path provided"}), 400
    
    file_path = data["filePath"]
    
    # Validate file exists
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return jsonify({"error": f"File not found: {file_path}"}), 404
    
    # Get file extension
    file_extension = os.path.splitext(file_path)[1].lower()
    file_name = os.path.basename(file_path)
    
    # Get schema info for the file
    schema = None
    file_type = ""
    
    try:
        if file_extension == '.csv':
            # Read first few lines of CSV to get column names
            import csv
            with open(file_path, 'r') as f:
                reader = csv.reader(f)
                header = next(reader)
                schema = "\n".join([f"{col}: text" for col in header])
                file_type = "csv"
                
        elif file_extension == '.db':
            # Get basic SQLite table info
            import sqlite3
            conn = sqlite3.connect(file_path)
            cursor = conn.cursor()
            
            # Get list of tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = [table[0] for table in cursor.fetchall()]
            
            # Build schema info
            schema_info = []
            for table in tables:
                cursor.execute(f"PRAGMA table_info({table});")
                columns = cursor.fetchall()
                schema_info.append(f"Table: {table}")
                for col in columns:
                    schema_info.append(f"  {col[1]}: {col[2]}")
            
            schema = "\n".join(schema_info)
            file_type = "sqlite"
            conn.close()
        else:
            return jsonify({"error": f"Unsupported file type: {file_extension}"}), 400
    except Exception as e:
        print(f"Error reading file schema: {str(e)}")
        return jsonify({"error": f"Error reading file: {str(e)}"}), 500
    
    # Update the active file in shared state
    shared_state.active_file = {
        "name": file_name,
        "path": file_path,
        "type": file_type,
        "schema": schema
    }
    
    print(f"Active file set to: {file_path}")
    
    return jsonify({
        "success": True,
        "message": f"Active file set to: {file_name}",
        "file": {
            "name": file_name,
            "path": file_path,
            "type": file_type,
            "schema": schema
        }
    }), 200

# Alias route for setting active file
@file_routes.route("/api/set-active-file", methods=["POST"])
def set_active_file_alias():
    print("Set active file alias endpoint called - forwarding to set_active_file")
    return set_active_file()

# Get the current active file
@file_routes.route("/active-file", methods=["GET"])
def get_active_file():
    if shared_state.active_file:
        return jsonify({
            "success": True,
            "file": shared_state.active_file
        }), 200
    else:
        return jsonify({
            "success": False,
            "error": "No active file set"
        }), 404

# Alias route for getting active file
@file_routes.route("/api/active-file", methods=["GET"])
def get_active_file_alias():
    print("Get active file alias endpoint called - forwarding to get_active_file")
    return get_active_file()

# TODO: Add route for listing uploaded files
# @file_routes.route("/files", methods=["GET"])
# def list_files():
#     pass

# TODO: Add route for deleting files
# @file_routes.route("/delete-file", methods=["POST"])
# def delete_file():
#     pass
