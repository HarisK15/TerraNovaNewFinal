#!/bin/bash

# Navigate to the backend directory
cd backend

# Activate virtual environment if exists (uncomment if needed)
# source venv/bin/activate

# Start the Flask backend server
echo "Starting Flask backend server..."
echo "The API will be available at http://localhost:5001"
export FLASK_APP=main.py
export FLASK_ENV=development
python -m flask run --host=0.0.0.0 --port=5001
