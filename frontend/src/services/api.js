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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};

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
        console.log('Sending query:', query);
        console.log('Active file:', activeFile);
        
        const response = await api.post('/query', {
            query,
            file_path: activeFile,
        });
        
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending query:', error);
        
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
        
        const response = await api.post('/set-active-file', {
            file_path: filePath,
        });
        
        console.log('Set active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to set the active file',
        };
    }
};

// Function to get the current active file
export const getActiveFile = async () => {
    try {
        const response = await api.get('/get-active-file');
        console.log('Get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting active file:', error);
        
        return {
            success: false,
            error: error.response?.data?.error || 
                   error.message || 
                   'Failed to get the active file',
        };
    }
};

// Export default object with all methods
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile,
};