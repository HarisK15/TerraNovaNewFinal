import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from app.routes.file_routes import file_routes
from app.routes.query_routes import query_bp
from app.utils.rag_examples import initialize_vector_store
import logging

# Author: Haris Kamran, K21084769 — March 2025
# Todo: add error handling for file size too big

logging.basicConfig(
    level=logging.DEBUG, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


print("Starting server...")
print("Loading environment variables....")
load_dotenv()

UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    print(f"Creating uploads Folder: {UPLOAD_FOLDER}")
    os.makedirs(UPLOAD_FOLDER)


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
# Allow larger files sizes
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.register_blueprint(file_routes)
app.register_blueprint(query_bp)


initialize_vector_store()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Server is running"}), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "Welcome to the Terranova API",
        "endpoints": {
            "file_upload": "/upload",
            "active_file": "/active-file",
            "query": "/query"
        },
        "version": "1.0.0"
    })
    

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    print(f"Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)