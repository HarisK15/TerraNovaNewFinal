#!/usr/bin/env python3
import requests
import json
import sys

# API endpoint
url = "http://localhost:5001/query"

# Test query payload
payload = {
    "query": "name 5 most common states",
    "filePath": sys.argv[1] if len(sys.argv) > 1 else "uploads/sample.csv"  # Pass file path as argument or use default
}

# Make the request
print(f"Testing query on file: {payload['filePath']}")
print(f"Query: {payload['query']}")
try:
    response = requests.post(url, json=payload)
    
    # Print status code
    print(f"Status code: {response.status_code}")
    
    # Pretty print the response
    try:
        response_json = response.json()
        print("Response JSON:")
        print(json.dumps(response_json, indent=2))
    except:
        print("Response text (not JSON):")
        print(response.text)
        
except Exception as e:
    print(f"Error making request: {str(e)}")
