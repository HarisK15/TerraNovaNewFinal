import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress, 
  Card, 
  CardContent,
  alpha,
  useTheme,
  Chip
} from '@mui/material';

// import fetch from 'node-fetch';
import axios from 'axios';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StorageIcon from '@mui/icons-material/Storage';
// import CodeIcon from '@mui/icons-material/Code';
// import BarChartIcon from '@mui/icons-material/BarChart'; 
import QueryInput from '../components/QueryInput';
import QueryResults from '../components/QueryResults';
import FileUpload from '../components/FileUpload';
import ExportTemplatesDialog from '../components/ExportTemplatesDialog';
import { useNavigate } from 'react-router-dom';

// This is the main query page component where users can talk to their data
// It allows uploading files, asking questions, and viewing results

// todo:
// - Add visualisation options for numerical data
// - Implement query history saving
// - Add proper error handling with retry logic


function QueryPage() {
// State variables to store all our data
  const [activeFile, setFileActive] = useState(null);
  const [schema, updateSchemaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setError] = useState(null);
  const [msgs, setConversation] = useState([]);
  const [exportDialogOpen, toggleExportDialog] = useState(false);
  const [exportData, setExportData] = useState(null);
  // const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null); 
  const chatContainerRef = useRef(null); 
  const navigate = useNavigate();
  const theme = useTheme();
  
  // same purple colors as Home.js
  const lightPurple = '#ede7f6'; 
  const purpleMain = '#9E77ED'; 
  const darkPurple = '#7b1fa2';

  // use somewhere
  var light_mode_bg = '#ffffff';
  
  // TODO: Remove this before production
  console.log("QueryPage rendering - active file:", activeFile);
  
  
  // const testData = {
  //   file: 'test_data.csv',
  //   schema: ['id', 'name', 'age', 'occupation', 'salary'],
  //   sampleQueries: [
  //     'Show me the average salary by occupation',
  //     'How many people are older than 30?',
  //     'Who has the highest salary?'
  //   ]
  // };
  
  // Fetch active file when component loads
  useEffect(() => {
      console.log("QueryPage mounted - fetching active file");
    fetchActiveFile();
    
    //todo:Add proper cleanup function
    return () => {
      // console.log('component unmounting');
    };
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    // console.log("scrolling down");
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs]);

  // handle scrolling when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      // Scroll to bottom when new messages are added
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [msgs]);
  
  // Function to get the active file from the backend
  const fetchActiveFile = async () => {

    // setFileActive('test.csv');
    // updateSchemaData(['id', 'name', 'value']);
    // return;

    try {
      let response = await axios.get('http://localhost:5001/api/files/active');
      console.log("Active file response:", response.data);
      
      if (response.data.success) {
        setFileActive(response.data.file);
        updateSchemaData(response.data.schema);
        console.log("Set active file:", response.data.file);
        console.log("Schema:", response.data.schema);
      }
    } catch (error) {
      console.error("Error fetching active file:", error);
    }
  };

  // This function handles sending the query to the backend
  const handleQuerySubmit = async (query) => {
    console.log("Submitting query:", query);
    
    // Check if query is empty
    if (!query.trim()) {
      console.log("Empty query");
      return;
    }

    // Return if no active file
    if (!activeFile) {
      console.log("No active file, showing error");
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    
    // Add user query to conversation first and store the updated messages
    const userMessage = { type: 'user', content: query };
    const updatedMsgs = [...msgs, userMessage];
    setConversation(updatedMsgs);

    try {
      console.log("Sending POST request to /query endpoint");
      const response = await axios.post('/query', { query });
      console.log("Query response:", response.data);
      
      // Only proceed if success is true
      if (response.data.success) {
        // Check if this is an export request
        if (response.data.is_export) {
          // Handle export response
          console.log("Export request detected");
          const exportData = {
            results: response.data.results,
            columns: response.data.columns,
            query: query,
            queryType: response.data.query_type,
            timestamp: new Date()
          };
          
          // Add response to conversation - use updatedMsgs which includes the user message
          setConversation([
            ...updatedMsgs,
            { 
              type: 'system', 
              content: 'I\'ll prepare your export with the requested data.', 
              queryType: response.data.query_type,
              queryCode: response.data.query_code,
              results: response.data.results,
              columns: response.data.columns,
              isExport: true
            }
          ]);
          
          // Set export data
          setExportData(exportData);
          
         // Open the export dialog automatically
          toggleExportDialog(true);
        } else {
          // Regular query response (not an export)
          console.log("Regular query response with results");
          
          // Add the system response to updatedMsgs which already has the user message
          const systemResponse = {
              type: 'system', 
              content: '', // No explanation - just showing data
              queryType: response.data.query_type,
              queryCode: response.data.query_code,
              results: response.data.results,
              columns: response.data.columns
          };
          
          // Update state with both user message and system response
          setConversation([...updatedMsgs, systemResponse]);
        }
      } else {
        // Add error message to conversation
        console.error("Query failed:", response.data.error);
        
        const errorMsg = response.data.error || 'An error occurred processing your query.';
        setConversation([...updatedMsgs, { type: 'error', content: errorMsg }]);
      }
    } catch (err) {
      // Add error message to conversation
      console.error("Query request error:", err);
      let errMsg = 'Network error. Check your connection and try again.';
      
      if (err.response) {
        errMsg = err.response.data.error || 'Server error. Please try again later.';
      }
      
      setConversation([...updatedMsgs, { type: 'error', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };
  
  // This is called when a new file is uploaded
  const handleNewFileUploaded = (fileInfo) => {
    console.log("New file uploaded:", fileInfo);
    setFileActive(fileInfo.filename);
    updateSchemaData(fileInfo.schema);
    // Clear previous conversation when a new file is uploaded
    setConversation([]);
    console.log("Conversation cleared for new file");
  };
  
  // This function opens the export dialog
  const handleOpenExportDialog = (data) => {
    console.log("Opening export dialog with data:", data);
    setExportData(data);
    toggleExportDialog(true);
  };

  // This function closes the export dialog
  const handleCloseExportDialog = () => {
    console.log("Closing export dialog");
    toggleExportDialog(false);
  };
  
  // Function to render the chat messages
  const renderChatMsgs = () => {
    if (msgs.length === 0) {
      return (
        <Box 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '32px',
            backgroundColor: lightPurple,
            borderRadius: '8px',
            border: '1px dashed',
            borderColor: '#ccc',
          }}
        >
          <HelpOutlineIcon style={{ fontSize: '36px', color: '#666', marginBottom: '16px' }} />
          <Typography variant="h6" style={{ marginBottom: '16px', fontWeight: 600, textAlign: 'center' }}>
            Ask a question about your data
          </Typography>
          <Typography variant="body2" color="text.secondary" style={{ textAlign: 'center', maxWidth: 450 }}>
            Try asking questions like "How many rows are in this file?" or "Show me the first 10 records"
          </Typography>
        </Box>
      );
    }

    console.log("Rendering messages:", msgs);

    return msgs.map((message, index) => {
      // This is the message from the user
      if (message.type === 'user') {
        return (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'flex-end' }} m={2}>
            <Box style={{ maxWidth: '80%' }}>
              <Box 
                p={2}
                style={{ 
                  backgroundColor: lightPurple,
                  borderRadius: '12px',
                  marginRight: '8px',
                }}
              >
                <Typography>{message.content}</Typography>
              </Box>
            </Box>
            <Box 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '50%', 
                backgroundColor: purpleMain,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <PersonIcon fontSize="small" />
            </Box>
          </Box>
        );
      }
      
      // This is an error message
      if (message.type === 'error') {
        return (
          <Box key={index} style={{ display: 'flex', marginBottom: '16px' }}>
            <Box 
              sx={{ 
                width: 30, 
                height: 30, 
                borderRadius: '50%', 
                bgcolor: '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mr: 1
              }}
            >
              <SmartToyIcon fontSize="small" />
            </Box>
            <Box 
              style={{ 
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '12px 12px 12px 0',
                padding: '16px',
                maxWidth: '80%'
              }}
            >
              <Typography>{message.content}</Typography>
            </Box>
          </Box>
        );
      }
      
      // This is the response from the system
      return (
        <Box key={index} m={3} style={{ display: 'flex' }}>
          <Box 
            style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              backgroundColor: purpleMain,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              marginRight: '8px',
              flexShrink: 0
            }}
          >
            <SmartToyIcon fontSize="small" />
          </Box>
          <Box 
            style={{ 
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '0',
              width: '100%',
              boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.05)`
            }}
          >
            {/* Only show the content message if there is one */}
            {message.content && (
              <Box style={{ padding: '16px' }}>
                <Typography>{message.content}</Typography>
              </Box>
            )}
            
            {/* Only show SQL code if it exists */}
            {message.queryCode && (
              <Box style={{ 
                padding: '16px', 
                backgroundColor: lightPurple,
                borderTop: message.content ? `1px solid #ccc` : 'none',
                borderBottom: message.results?.length > 0 ? `1px solid #ccc` : 'none',
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Chip 
                    label={message.queryType === 'sql' ? 'SQL Query' : 'Query'} 
                    size="small" 
                    sx={{ 
                      backgroundColor: lightPurple,
                      color: purpleMain,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }} 
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  style={{ 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: '0',
                    padding: '8px',
                    backgroundColor: '#f7f7f7',
                    borderRadius: '8px',
                    color: '#666',
                    fontSize: '0.85rem',
                    overflow: 'auto'
                  }}
                >
                  {message.queryCode}
                </Typography>
              </Box>
            )}
            
            {/* Show results if we have them */}
            {message.results && message.columns && (
              <Box style={{ width: '100%' }}>
                <QueryResults 
                  results={message.results} 
                  columns={message.columns} 
                  onExport={message.isExport ? null : handleOpenExportDialog}
                />
              </Box>
            )}
          </Box>
        </Box>
      );
    });
  };

  // function validateExport(exportData) {
  //   if (!exportData) return false;
  //   if (!exportData.results || !Array.isArray(exportData.results)) return false;
  //   if (!exportData.columns || !Array.isArray(exportData.columns)) return false;
  //   return true;
  // }

  
  // improve later
  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', p: 3 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          m={2}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <ChatIcon 
            style={{ 
              fontSize: '28px', 
              marginRight: '16px',
              color: purpleMain,
              background: lightPurple,
              padding: '8px',
              borderRadius: '50%',
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: purpleMain
            }}
          >
            Chat with your Data
          </Typography>
        </Box>
        
       
        {activeFile ? (
          // File info when a file is active
          <Alert 
            icon={false}
            severity="info" 
            p={2}
            style={{ 
              marginBottom: '16px', 
              width: '100%', 
              maxWidth: 600,
              borderRadius: '8px',
              backgroundColor: lightPurple,
              border: `1px solid #ccc`,
            }}
          >
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon style={{ marginRight: '8px', color: purpleMain }} />
                <Typography variant="body2">
                  Active file: <strong>{activeFile}</strong>
                </Typography>
              </Box>
              <Button 
                size="small" 
                onClick={() => {
                  console.log("Upload new file button clicked");
                  setFileActive(null);
                }}
                sx={{ ml: 2 }}
              >
                Upload new
              </Button>
            </Box>
          </Alert>
        ) : (
          // File upload section if no active file
          <Paper 
            elevation={0}
            sx={{ p: 3, mb: 3, width: '100%' }}
            style={{
              border: '1px solid',
              borderColor: '#ccc',
              borderRadius: '8px',
              backgroundColor: lightPurple
            }}
          >
            <Typography variant="h6" gutterBottom>
              Upload a file to get started
            </Typography>
            <Typography variant="body2" color="text.secondary" style={{ marginBottom: '24px' }}>
              Upload a CSV file or SQLite database to start querying it
            </Typography>
            <FileUpload onUploadSuccess={handleNewFileUploaded} />
          </Paper>
        )}
      </Box>
      
      {/* Chat section */}
      {activeFile && (
        <>
          <Box 
            m={2}
            ref={chatContainerRef} 
            style={{ 
              maxHeight: '60vh',
              overflowY: 'auto',
              padding: '16px',
              border: '1px solid',
              borderColor: '#ccc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
            id="chat-messages-container"
          >
            {renderChatMsgs()}
            <div ref={scrollRef} />
          </Box>

          {/* Input box */}
          <QueryInput 
            onSubmit={handleQuerySubmit} 
            loading={loading} 
            disabled={!activeFile}
            // showSuggestions={true} 
          />
          
          {/* Small help text at the bottom */}
          <Typography variant="caption" color="text.secondary" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
            Try asking "How many rows are in the file?" or "Show me the first 10 records"
          </Typography>
        </>
      )}
      
      {/* Export dialog */}
      <ExportTemplatesDialog
        open={exportDialogOpen}
        onClose={handleCloseExportDialog}
        data={exportData?.results || []}
        columns={exportData?.columns || []}
        initialFormat={exportData?.exportFormat || 'xlsx'}
        initialTemplateType={exportData?.exportTemplateType || 'basic'}
      />
    </Box>
  );
}

export default QueryPage;
