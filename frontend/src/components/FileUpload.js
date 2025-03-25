import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Box, LinearProgress, Alert, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';

// This component handles file uploading functionality
function FileUpload({ onUploadSuccess }) {
  // State variables to track the file and upload status
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null); // Reference to the hidden file input
  
  // Todo: Add file validation for size - not working yet
  
  useEffect(() => {

  }, []);

  const checkFile = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    console.log("Got file:", file.name);

    // Check if file is okay
    if (!file.name.endsWith('.db') && !file.name.endsWith('.csv')) {
      console.error("Invalid file type");
      setError('Only SQLite database (.db) or CSV (.csv) files are allowed');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };
  const sendFile = async () => {
    console.log("uploading...");
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    // Todo: Add file size check (max 10MB)
    const formData = new FormData();
    formData.append('file', selectedFile);


    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      
      if (response.data.success) {
        console.log("ok", response.data.filename);
        setSuccess(`File successfully uploaded: ${response.data.filename}`);
        setSelectedFile(null);
        // Not sure if this is the best way to set active file
        try {
          await axios.post('/set-active-file', {
            filePath: response.data.path
          });
          if (onUploadSuccess) {
            onUploadSuccess({
              filename: response.data.filename,
              schema: response.data.schema
            });
          }
        } catch (err) {
          console.log("Error setting file as active:", err);
        }
      } else {
        console.log("Upload failed with error:", response.data.error);
        setError('Upload failed');
      }
    } catch (err) {
      console.log("Error during upload:", err);
      setError('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };
  // works?
  const openFilePicker = () => {
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
          onClick={openFilePicker}>
        
          {/* Hidden file input element */}
          <input
            type="file"
            accept=".db,.csv"
            onChange={checkFile}
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
              {selectedFile.name} ({selectedFile.size < 1024 ? 
                selectedFile.size + ' bytes' : 
                selectedFile.size < 1048576 ? 
                  (selectedFile.size / 1024).toFixed(2) + ' KB' : 
                  (selectedFile.size / 1048576).toFixed(2) + ' MB'})
            </Typography>

            {/* Upload button */}
            <Button
              variant="contained"
              color="primary"
              onClick={sendFile}
              disabled={isUploading}
              sx={{ mt: 2 }}
              fullWidth>
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
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Success messages */}
        {success && (
          <Alert 
            severity="success" 
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}
      </Box>
    </Box>
  );
}
export default FileUpload;

// Todo: Maybe add drag and drop support
