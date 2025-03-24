# It currently supports basic validation for .csv and .db files.
# Todo: Add better validation and file size limits if needed.

import os
import uuid  
import logging

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Save uploaded file to the 'uploads' directory
def save_file(file):
    allowed_extensions = {"csv", "db"}
    if not file.filename:
        logger.info("No file uploaded")
        return {"No file uploaded"}
    try:
        file_extension = file.filename.split(".")[-1].lower()
    except:
        return {"error": "Invalid filename format"}
    if file_extension not in allowed_extensions:
        return {"Only upload a .csv or .db file"}
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    upload_folder = os.path.join(project_root, "uploads")
    
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
        return {f"failed to save {str(e)}"}
    return {
        "success": True, 
        "filename": unique_filename, 
        "original_filename": file.filename,
        "path": file_path
    }