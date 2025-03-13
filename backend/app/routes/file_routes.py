# This file handles uploading and managing files
# It allows the user to upload CSV and SQLite DB files and saves them to the uploads folder
# TODO: Add more validation for different file types
# TODO: Add error handling for large files

import os
from flask import Blueprint, request, jsonify
from app.utils.file_handler import save_file

# Create a blueprint for file routes
file_routes = Blueprint("file_routes", __name__, url_prefix="/")

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
    
    # Return the result to the frontend
    return jsonify(result), 200

# TODO: Add route for listing uploaded files
# @file_routes.route("/files", methods=["GET"])
# def list_files():
#     pass

# TODO: Add route for deleting files
# @file_routes.route("/delete-file", methods=["POST"])
# def delete_file():
#     pass
