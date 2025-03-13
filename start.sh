#!/bin/bash

# Start the backend server
cd backend
echo "Starting Flask backend server..."
python -c "from main import app; app.run(host='0.0.0.0', port=5001, debug=True)" &
BACKEND_PID=$!

# Wait a moment for the backend to start
sleep 2

# Start the frontend development server
cd ../frontend
echo "Installing frontend dependencies..."
npm install
echo "Starting React frontend server..."
npm start &
FRONTEND_PID=$!

# Function to handle script termination
cleanup() {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Set up trap to catch termination signals
trap cleanup INT TERM

# Keep the script running
echo "Both servers are running. Press Ctrl+C to stop."
wait
