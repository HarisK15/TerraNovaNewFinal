#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env file for React
echo "Setting up environment variables..."
echo "REACT_APP_API_URL=http://localhost:5001" > .env

# Clear any cached files that might cause issues
echo "Clearing React cache..."
rm -rf node_modules/.cache

# Start the React development server
echo "Starting React frontend server..."
echo "The app will open in your browser at http://localhost:3000"
NPM_CONFIG_FORCE=true BROWSER=none npm start

# Give useful information to the user
echo ""
echo "---------------------------------------------"
echo "If the browser doesn't open automatically:"
echo "Visit http://localhost:3000 in your browser"
echo "---------------------------------------------"
