import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Author: Haris — March 2025


# Import route blueprints
from app.routes.file_routes import file_routes
from app.routes.query_routes import query_bp

# Print some startup info
print("Starting server...")
print("Loading environment variables...")

# Load environment variables from .env file
load_dotenv()

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    print(f"Creating uploads directory: {UPLOAD_FOLDER}")
    os.makedirs(UPLOAD_FOLDER)
else:
    print(f"Uploads directory already exists: {UPLOAD_FOLDER}")

# Initialize Flask app
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Allow larger file uploads (default is 16MB)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB limit

# Enable CORS for frontend requests
# This is needed for the React app to communicate with the Flask backend
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
print("CORS enabled for all origins")

# Register route blueprints
app.register_blueprint(file_routes)
app.register_blueprint(query_bp)
print("Route blueprints registered")

# Add a simple health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    print("Health check endpoint called")
    return jsonify({"status": "healthy", "message": "Server is running"}), 200

# Add a simple root endpoint
@app.route('/', methods=['GET'])
def root():
    print("Root endpoint called")
    return jsonify({
        "message": "Welcome to the Terranova API",
        "endpoints": {
            "file_upload": "/upload",
            "active_file": "/active-file",
            "query": "/query"
        },
        "version": "1.0.0"
    })
    
# Run the app
if __name__ == '__main__':
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5050))
    print(f"Starting server on port {port}...")
    
    # Run the Flask development server directly
    app.run(host='0.0.0.0', port=port, debug=True)