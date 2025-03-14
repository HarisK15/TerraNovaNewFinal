import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Box, LinearProgress, Alert, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

// This component handles file uploading functionality
// It allows users to upload a CSV or SQLite database file
// And reports on the upload progress and status
function FileUpload({ onUploadSuccess }) {
  // State variables to track the file and upload status
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null); // Reference to the hidden file input
  
  // Log when component mounts
  useEffect(() => {
    console.log("FileUpload component mounted");
    
    // This is called when the component unmounts
    return () => {
      console.log("FileUpload component unmounting");
      
      // Clean up any files that might be in memory
      if (selectedFile) {
        console.log("Cleaning up selected file:", selectedFile.name);
      }
    };
  }, [selectedFile]);

  // This function is triggered when a file is selected
  const handleFileChange = (event) => {
    console.log("File selection changed");
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);

    // Check if the file is the right type
    // We only want .db (SQLite) or .csv files
    const fileExtension = file.name.split('.').pop().toLowerCase();
    console.log("File extension:", fileExtension);
    
    if (fileExtension !== 'db' && fileExtension !== 'csv') {
      console.error("Invalid file type:", fileExtension);
      setError('Only SQLite database (.db) or CSV (.csv) files are allowed');
      setSelectedFile(null);
      event.target.value = null; // Reset file input
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);
    console.log("File validated and set to state");
  };

  // Function to format file size in a human-readable way
  // Takes bytes and converts to KB, MB etc.
  const formatFileSize = (bytes) => {
    console.log("Formatting file size from bytes:", bytes);
    
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      // Convert to KB (1024 bytes = 1 KB)
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      // Convert to MB (1048576 bytes = 1 MB)
      return (bytes / 1048576).toFixed(2) + ' MB';
    }
  };

  // This function handles the file upload process
  const handleUpload = async () => {
    console.log("Upload button clicked");
    
    // First check if a file is selected
    if (!selectedFile) {
      console.error("No file selected for upload");
      setError('Please select a file first');
      return;
    }

    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log("Form data created with file:", selectedFile.name);

    // Update state to show upload in progress
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    console.log("Starting upload process");

    try {
      console.log("Sending POST request to /upload endpoint");
      // Upload the file to the server
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Track upload progress
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log("Upload progress:", percentCompleted + "%");
          setUploadProgress(percentCompleted);
        },
      });

      console.log("Upload response received:", response.data);
      
      // Handle successful upload
      if (response.data.success) {
        console.log("File successfully uploaded:", response.data.filename);
        setSuccess(`File successfully uploaded: ${response.data.filename}`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;

        // Set the uploaded file as the active file
        try {
          console.log("Setting uploaded file as active");
          await axios.post('/set-active-file', {
            filePath: response.data.path // Use the full path returned from the API
          });
          
          console.log("File set as active successfully");
          
          // Notify parent component about the successful upload
          if (onUploadSuccess) {
            console.log("Calling onUploadSuccess callback");
            onUploadSuccess({
              filename: response.data.filename,
              schema: response.data.schema
            });
          }
        } catch (err) {
          console.error("Error setting file as active:", err);
          setError('File uploaded but could not be set as active file');
        }
      } else {
        console.error("Upload failed:", response.data.error);
        setError(response.data.error || 'Failed to upload file');
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.error || 'Error uploading file. Please try again.');
    } finally {
      console.log("Upload process completed");
      setIsUploading(false);
    }
  };

  // This function simulates clicking the hidden file input
  const triggerFileInput = () => {
    console.log("Triggering file input click");
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Drop zone for file upload */}
        <Box
          sx={{
            border: '2px dashed #cccccc',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            backgroundColor: '#fafafa',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
          onClick={triggerFileInput}
        >
          {/* Hidden file input element */}
          <input
            type="file"
            accept=".db,.csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          {/* Upload icon */}
          <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            Click to select a SQLite database (.db) or CSV file (.csv)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maximum file size: 10MB
          </Typography>
        </Box>

        {/* Selected file information and upload button */}
        {selectedFile && (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected File:
            </Typography>
            <Typography variant="body2">
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </Typography>

            {/* Upload button */}
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isUploading}
              sx={{ mt: 2 }}
              fullWidth
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>

            {/* Progress bar */}
            {isUploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  {uploadProgress}% complete
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Error messages */}
        {error && (
          <Alert 
            severity="error" 
            onClose={() => {
              console.log("Closing error alert");
              setError(null);
            }}
          >
            {error}
          </Alert>
        )}

        {/* Success messages */}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => {
              console.log("Closing success alert");
              setSuccess(null);
            }}
          >
            {success}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

// Export the component so it can be imported in other files
export default FileUpload;
