// Todo:add retry logic later
import axios from 'axios';
const API_BASE_URL = 'http://localhost:5050';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, 
});

// Function to handle file uploads
export const uploadFile = async (file) => {
    try {
        console.log('Trying to upload:', file.name);
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Cant upload file:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
};

// Function to send query
export const sendQuery = async (query, activeFile) => {
    try {
        const payload = {
            query: query,
        };
        if (activeFile) {
            payload.active_file = activeFile;
        }
        console.log('Sending query to backend:', payload);
        const response = await api.post('/query', payload);
        console.log('Query response:', response.data);
        return response.data;
    } catch (error) {
        console.error('cant send query:', error);
        return { success: false, error: error.message || 'query failed' };
    }
};

// set active file for querying
export const setActiveFile = async (filePath) => {
    try {
        const payload = {
            file_path: filePath,
        };
        const response = await api.post('/active-file', payload);
        return response.data;
    } catch (error) {
        console.error('problem setting active file:', error);
        return { success: false, error: error.message || 'Failed to set file' };
    }
};

//get the current active file
export const getActiveFile = async () => {
    try {
        console.log('Getting active file');
        const response = await api.get('/active-file');
        console.log('get active file response:', response.data);
        return response.data;
    } catch (error) {
        console.error('problem getting active file:', error);
        return { success: false, error: error.message || 'Failed to get file' };
    }
};
export default {
    uploadFile,
    sendQuery,
    setActiveFile,
    getActiveFile
};
