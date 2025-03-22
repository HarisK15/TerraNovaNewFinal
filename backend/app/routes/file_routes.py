import os
from flask import Blueprint, request, jsonify
from app.utils.file_handler import save_file

file_routes = Blueprint("file_routes", __name__, url_prefix="/")  

@file_routes.route("/upload", methods=["POST", "GET"])
def upload_file():
    if request.method == "GET":
        return jsonify({"message": "Use POST to upload files"}), 405
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    result = save_file(file)
    return jsonify(result), 200
