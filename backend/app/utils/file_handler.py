# This file handles file uploads and storage
# It saves files to the uploads folder and validates their formats
# TODO: Add more validation for different file types
# TODO: Maybe add file size checks

import os
import uuid  # For generating unique filenames

def save_file(file):
    """Save an uploaded file to the uploads directory"""
    print(f"Saving file: {file.filename}")
    
    # Validate file type (only allow .csv and .db)
    allowed_extensions = {"csv", "db"}
    
    # Basic file validation
    if not file.filename:
        print("Error: Empty filename")
        return {"error": "Empty filename"}
    
    # Get file extension
    try:
        file_extension = file.filename.split(".")[-1].lower()
        print(f"File extension: {file_extension}")
    except:
        print("Error: Couldn't determine file extension")
        return {"error": "Invalid filename format"}

    # Check if extension is allowed
    if file_extension not in allowed_extensions:
        print(f"Error: File type not allowed: {file_extension}")
        return {"error": "Invalid file type. Only CSV and SQLite DB files are allowed."}

    # Get the upload folder path from the app config or use default
    # Get absolute path to the uploads directory relative to backend
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_folder = os.path.join(backend_dir, "uploads")
    
    print(f"Using upload folder: {upload_folder}")

    # Ensure upload folder exists
    try:
        os.makedirs(upload_folder, exist_ok=True)
        print(f"Created/confirmed uploads directory: {upload_folder}")
    except Exception as e:
        print(f"Error creating upload directory: {str(e)}")
        return {"error": f"Failed to create upload directory: {str(e)}"}

    # Generate a unique filename to prevent overwriting existing files
    try:
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_folder, unique_filename)
        print(f"Saving file to: {file_path}")
        
        # Actually save the file
        file.save(file_path)
        print(f"File saved successfully as: {unique_filename}")
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        return {"error": f"Failed to save file: {str(e)}"}

    # Return success response with file information
    return {
        "success": True, 
        "filename": unique_filename, 
        "original_filename": file.filename,
        "path": file_path
    }