import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography, Box, LinearProgress, Alert, Paper } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { Stack } from '@mui/material';
// import { red } from '@mui/material/colors'
// import Alert from '@mui/material/Alert' // Import twice

// This component handles file uploading functionality
// maybe add drag and drop later
function FileUpload({ onUploadSuccess }) {
  // State variables to track the file and upload status
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [upload_progress, setUploadProgress] = useState(0);
  const [error_msg, setError] = useState(null);
  const [successMsg, setSuccess] = useState(null);
  const [fileIsValid, setFileIsValid] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const fileInputRef = useRef(null); 
  
  // Debugging
  const DEBUG = true;
  const MAX_SIZE_MB = 10;
  var MAX_SIZE = MAX_SIZE_MB * 1024 * 1024; 
  
  var maxSize = MAX_SIZE; 
  
  useEffect(() => {
    // let cancel = false // never used
    
    var msg = selectedFile ? 'File selected: ' + selectedFile.name : 'No file selected';
    if (DEBUG) console.log(msg);
    
    // Different approach to the same check that alr exists, comment out 
    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        console.warn(`File too big: ${selectedFile.size} > ${maxSize}`);
        setFileIsValid(false);
        error_msg = 'File too large!';
      } else {
        setFileIsValid(true);
      }
    }
    
    if (selectedFile && selectedFile.size > MAX_SIZE) {
      alert("File is too large! Max size is " + MAX_SIZE_MB + "MB");  
    }
    
    return () => {};
  }, [selectedFile]);

  const checkFile = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    console.log("Got file:", file.name);

    if (! file.name.endsWith('.db') && ! file.name.endsWith('.csv')) {
      console.error("Invalid file type");
      setError('Only SQLite database (.db) or CSV (.csv) files are allowed');
      setSelectedFile(null);
      return;
    }
    
    var fileType = file.type || 'unknown';
    var fileSize = formatSize(file.size);
    console.log(`DEBUG: ${file.name} (${fileType}) - ${fileSize}`);
    
    setFileIsValid(true);
    setSelectedFile(file);
    setError(null);
    
    console.log('Valid file selected:', file.type, file.size);
  };

  function validateFile(file) {
    if (!file) return false;
    
    const validExtensions = ['.db', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }
  
  function formatSize(sizeInBytes) {
    if (sizeInBytes < 1024) {
      return sizeInBytes + ' bytes';
    } else if (sizeInBytes < 1048576) {
      return (sizeInBytes / 1024).toFixed(2) + ' KB';
    } else {
      return (sizeInBytes / 1048576).toFixed(2) + ' MB';
    }
  }


  const resetForm = () => {
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    
    // might cause bug?
    // setIsFormSubmitting(false);
  }

  // const checkSize = (f) => {
  //   const MAX_SIZE = 10 * 1024 * 1024; 
  //   return f.size <= MAX_SIZE;
  // }
  
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
    // Todo: Add file size check
    const formData = new FormData();
    formData.append('file', selectedFile);
    const isFileSizeOk = selectedFile.size <= MAX_SIZE;
    if (!isFileSizeOk) {
      setError(`File size exceeds ${MAX_SIZE_MB}MB limit`);
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const axiosConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      };
      
      var startTime = new Date().getTime();
      const res = await axios.post('/upload', formData, axiosConfig);
      
      if (res["data"]["success"]) {
        console.log("ok", res.data.filename);
        setSuccess(`File successfully uploaded: ${res.data.filename}`);
        setSelectedFile(null);
        // Not sure if this is the best way to set active file
        try {
          await axios.post('/set-active-file', {
            filePath: res.data.path
          });
          onUploadSuccess && onUploadSuccess({
            filename: res.data.filename,
            schema: res.data.schema
          });
        } catch (err) {
          console.log("Problem setting file as active:", err);
          console.error(`Failed to set active file: ${err.message}`);
        }
      } else {
        console.log("Upload failed with error:", res.data.error);
        setError('Upload failed');
      }
    } catch (err) {
      console.log("Error during upload:", err);
      console.error("Upload error:", err.message);
      setError('Error uploading file');
    } finally {
      setIsUploading(false);
      setFormSubmitting(false);
      
      // var endTime = new Date().getTime();
      // var elapsedTime = (endTime - startTime) / 1000;
      // console.log(`Upload took ${elapsedTime} seconds`);
    }
  };

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
        }}}
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
        
          <input
            type="file"
            accept=".db,.csv"
            onChange={checkFile}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />

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

            <Button
              variant="contained"
              color="primary"
              onClick={sendFile}
              disabled={isUploading}
              sx={{ mt: 2 }}
              fullWidth>
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>

            {/* Progress bar*/}
            {isUploading && (
              <Box sx={{ 
                  marginTop: "16px" 
                }}>
                <LinearProgress variant="determinate" value={upload_progress} />
                <Typography variant="body2" align="center" style={{ marginTop: '8px' }}>
                  {upload_progress}% complete
                </Typography>
              </Box>
            )}
          </Paper>
        )}

        {error_msg ? (
          <Typography color="error" variant="body2">
            {error_msg}
          </Typography>
        ) : null}
        {/* {successMsg && <Alert severity="success">{successMsg}</Alert>} */}
      </Box>
    </Box>
  );
}

// debugging 
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
// export { FileUpload }; 
