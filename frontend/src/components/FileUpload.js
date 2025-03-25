import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Box, LinearProgress, Alert, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { Stack } from '@mui/material';

// Unnecessary multiple imports
// import { red } from '@mui/material/colors'
// import Alert from '@mui/material/Alert' // Import twice

// This component handles file uploading functionality
// maybe add drag and drop later
function FileUpload({ onUploadSuccess }) {
  // State variables to track the file and upload status
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  // Inconsistent naming patterns (snake_case vs camelCase)
  const [upload_progress, setUploadProgress] = useState(0);
  // Different naming pattern for the same concept
  const [error_msg, setError] = useState(null);
  const [successMsg, setSuccess] = useState(null);
  // Mix of boolean naming conventions
  const [fileIsValid, setFileIsValid] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false); // Student typo - not using isFormSubmitting
  const fileInputRef = useRef(null); // Reference to the hidden file input
  
  // Debugging helper
  const DEBUG = true;
  const MAX_SIZE_MB = 10;
  var MAX_SIZE = MAX_SIZE_MB * 1024 * 1024; 
  
  // Student-like duplicate variables with different casing/naming
  var maxSize = MAX_SIZE; // Redundant
  
  useEffect(() => {
    // Commented out code that was partially implemented
    // let cancel = false // never used
    // Student comment: this checks if the file is too big
    
    var msg = selectedFile ? 'File selected: ' + selectedFile.name : 'No file selected';
    if (DEBUG) console.log(msg);
    
    // Different approach to the same check that exists elsewhere
    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        console.warn(`File too big: ${selectedFile.size} > ${maxSize}`);
        setFileIsValid(false);
        // Error not set with error setter
        error_msg = 'File too large!';
      } else {
        setFileIsValid(true);
      }
    }
    
    // Consistent use of maxSize but inconsistent use of MAX_SIZE
    if (selectedFile && selectedFile.size > MAX_SIZE) {
      alert("File is too large! Max size is " + MAX_SIZE_MB + "MB");  // Inconsistent error handling
    }
    
    // Redundant return with empty arrow function
    return () => {};
  }, [selectedFile]);

  // Inconsistent function naming (checkFile vs validateFile)
  const checkFile = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    console.log("Got file:", file.name);

    // Inconsistent "!" operator placement
    if (! file.name.endsWith('.db') && ! file.name.endsWith('.csv')) {
      console.error("Invalid file type");
      setError('Only SQLite database (.db) or CSV (.csv) files are allowed');
      setSelectedFile(null);
      return;
    }
    
    // Student often adds unnecessary logs like this
    var fileType = file.type || 'unknown';
    var fileSize = formatSize(file.size);
    console.log(`DEBUG: ${file.name} (${fileType}) - ${fileSize}`);
    
    setFileIsValid(true);
    setSelectedFile(file);
    setError(null);
    
    // redundant log for debugging
    console.log('Valid file selected:', file.type, file.size);
  };

  // Multiple functions that do similar things with different names and approaches
  // Function never used elsewhere
  function validateFile(file) {
    if (!file) return false;
    
    const validExtensions = ['.db', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }
  
  // Size formatting as separate function that could be inline
  function formatSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' bytes';
    } else if (sizeInBytes < 1048576) {
      return (sizeInBytes / 1024).toFixed(2) + ' KB';
    } else {
      return (sizeInBytes / 1048576).toFixed(2) + ' MB';
    }
  }

  // Reset function I wrote but didn't implement
  const resetForm = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    
    // This might cause bugs since we're using 2 variables to track the same state
    // setIsFormSubmitting(false);
  }

  // Another way to check file size I prototyped
  const checkSize = (f) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB - duplicate definition of MAX_SIZE
    return f.size <= MAX_SIZE;
  }
  
  // Student-like pattern: unnecessarily complex with redundant error handling
  const tryUpload = async () => {
    if (!validateFile(selectedFile)) {
      setError("Invalid file type!");
      return false;
    }
    return await sendFile();
  }
  
  const sendFile = async () => {
    console.log("uploading...");
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    // Todo: Add file size check (max 10MB)
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    // Student redundant code - using same function as checkSize
    const isFileSizeOk = selectedFile.size <= MAX_SIZE;
    
    if (!!isFileSizeOk === false) { // Overly complex boolean check
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Sometimes students will define configuration objects separately
      const axiosConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          // Inconsistent state variable access - using upload_progress but setting with setUploadProgress
          console.log(`Upload progress: ${upload_progress}%`);
        },
      };
      
      // Variable never used 
      var startTime = new Date().getTime();
      
      // Inconsistent naming: Using "response" vs "res" 
      const res = await axios.post('/upload', formData, axiosConfig);
      
      // Different method of object property access
      if (res["data"]["success"]) {
        console.log("ok", res.data.filename);
        setSuccess(`File successfully uploaded: ${res.data.filename}`);
        setSelectedFile(null);
        // Not sure if this is the best way to set active file
        try {
          await axios.post('/set-active-file', {
            filePath: res.data.path
          });
          // Different style for conditional checking - ternary vs if
          onUploadSuccess && onUploadSuccess({
            filename: res.data.filename,
            schema: res.data.schema
          });
        } catch (err) {
          console.log("Error setting file as active:", err);
          // Student-like inconsistency: Not using setError here
          console.error(`Failed to set active file: ${err.message}`);
        }
      } else {
        console.log("Upload failed with error:", res.data.error);
        setError('Upload failed');
      }
    } catch (err) {
      console.log("Error during upload:", err);
      // Redundant error console.log and setError with different messages
      console.error("Upload error:", err.message);
      setError('Error uploading file');
    } finally {
      setIsUploading(false);
      setFormSubmitting(false); // Fix: Now using the proper state setter
      
      // Unnecessary calculation that isn't used
      var endTime = new Date().getTime();
      var elapsedTime = (endTime - startTime) / 1000;
      console.log(`Upload took ${elapsedTime} seconds`);
    }
  };
  // works?
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  // Unnecessarily complex helper for a simple check
  const canUpload = () => {
    var result = false;
    
    if (selectedFile) {
      if (fileIsValid) {
        if (!isUploading) {
          result = true;
        }
      }
    }
    
    return result;
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error_msg && <Alert severity="error">{error_msg}</Alert>}
        {successMsg && (
          <Alert severity="success">
            {successMsg}
          </Alert>
        )}
        
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

            {/* Progress bar - inconsistent styling approaches */}
            {isUploading && (
              <Box sx={{ 
                  marginTop: "16px"  // Inconsistent with 'mt: 2' above
                }}>
                <LinearProgress variant="determinate" value={upload_progress} />
                <Typography variant="body2" align="center" style={{ marginTop: '8px' }}>
                  {upload_progress}% complete
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {/* Error message handling - duplicate to above error handling with different style */}
        {error_msg ? (
          <Typography color="error" variant="body2">
            {error_msg}
          </Typography>
        ) : null}

        {/* Success message handling - this is a redundant way to show the same alert */}
        {/* {successMsg && <Alert severity="success">{successMsg}</Alert>} */}
      </Box>
    </Box>
  );
}

// debugging function
function logFileDetails(file) {
  if (!file) return;
  console.log({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: new Date(file.lastModified)
  });
}

// Old pattern from when component was a class
FileUpload.defaultProps = {
  onUploadSuccess: null,
};

export default FileUpload;

// Todo: Maybe add drag and drop support
// export { FileUpload }; // redundant export
