//📌 Handles API communication between React and Flask.
//
// ✅ Features to Implement:
// 	•	Function to upload files to /upload API
// 	•	Function to send user queries to /query API
// 	•	Function to fetch available database tables (if DB is uploaded)
// 	•	Handle API errors and display appropriate messages

import axios from 'axios';

// Set the base URL for all requests - updated to use port 5050
const API_BASE_URL = 'http://localhost:5050';

// Create an axios instance with some default settings
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to handle file uploads
export const uploadFile = async (file) => {
    try {
        console.log('Uploading file:', file.name);
        
        // Create FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        
        // Send POST request to upload endpoint
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        console.log('Upload response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        
        // Return error message in a consistent format
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'An unknown error occurred during upload',
        };
    }
};

// Function to send a query
export const sendQuery = async (query, activeFile) => {
    try {
        // Prepare the query payload
        const payload = {
            query: query,
        };
        
        // If activeFile is provided, include it in the request
        if (activeFile) {
            payload.active_file = activeFile;
        }
        
        console.log('Sending query:', payload);
        
        // Send POST request to query endpoint
        const response = await api.post('/query', payload);
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
        // Return error message in a consistent format
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'An unknown error occurred while processing your query',
        };
    }
};

// Function to set the active file for querying
export const setActiveFile = async (filePath) => {
    try {
        console.log('Setting active file:', filePath);
        
        // Prepare the payload
        const payload = {
            file_path: filePath,
        };
        
        // Send POST request to set active file
        const response = await api.post('/active-file', payload);
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        // Return error message in a consistent format
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'An unknown error occurred while setting the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        console.log('Getting active file');
        
        // Send GET request to active-file endpoint
        const response = await api.get('/active-file');
        
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        // Return error message in a consistent format
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'An unknown error occurred while getting the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile
};
