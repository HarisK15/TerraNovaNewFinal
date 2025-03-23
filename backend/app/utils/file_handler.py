# This file handles file uploads and saves them to the uploads folder.
# It currently supports basic validation for .csv and .db files.
# TODO: Add better validation and file size limits if needed.


import os
import uuid  
import logging

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

def save_file(file):
    """Save an uploaded file to the uploads directory"""    
    # Validate file type
    allowed_extensions = {"csv", "db"}
    if not file.filename:
        logger.info("No file uploaded")
        return {"error": "No file uploaded"}
    
    # Get file extension
    try:
        file_extension = file.filename.split(".")[-1].lower()
    except:
        return {"error": "Invalid filename format"}

    # Check if its .csv or .db
    if file_extension not in allowed_extensions:
        return {"error": "Only .csv or .db allowed"}

    # Get absolute path to the uploads directory 
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_folder = os.path.join(backend_dir, "uploads")
    
    try:
        os.makedirs(upload_folder, exist_ok=True)
    except Exception as e:
        return {"error": f"couldnt create: {str(e)}"}
    
    try:
        # Generate a unique filename 
        unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
    except Exception as e:
        logger.info(f"Error saving {str(e)}")
        return {"error": f"something went wrong when saving {str(e)}"}
    return {
        "success": True, 
        "filename": unique_filename, 
        "original_filename": file.filename,
        "path": file_path
    }