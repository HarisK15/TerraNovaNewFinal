# 📌 Handles file uploads (CSV & SQLite DB) and stores them.
#
# ✅ Features to Implement:
# 	•	Accept file uploads & save to /uploads/
# 	•	Validate file type before saving
# 	•	Return file details after upload
import os
from flask import Blueprint, request, jsonify
from app.utils.file_handler import save_file

file_routes = Blueprint("file_routes", __name__, url_prefix="/")  # ✅ Use `url_prefix="/"`

@file_routes.route("/upload", methods=["POST", "GET"])
def upload_file():
    if request.method == "GET":
        return jsonify({"message": "Use POST to upload files"}), 405
    file = request.files.get("file")
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    result = save_file(file)
    return jsonify(result), 200
