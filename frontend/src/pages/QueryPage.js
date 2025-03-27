import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Alert,
  Chip,
  Dialog,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StorageIcon from '@mui/icons-material/Storage';
//import codeIcon from '@mui/icons-material/Code';
import QueryInput from '../components/QueryInput';
import QueryResults from '../components/QueryResults';
import FileUpload from '../components/FileUpload';
import ExportTemplatesDialog from '../components/ExportTemplatesDialog';
import { useNavigate } from 'react-router-dom';

// main query page component where users can talk to their data
// allows uploading files, asking questions, and viewing results

// todo:
// - add visualisation options for numerical data
// - implement query history saving
// - add proper error handling with retry logic


function QueryPage() {
// state variables to store all our data
  const [activeFile, setFile] = useState(null);
  const [schema, setStuff] = useState(null);
  const [loading, isLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [msgs, addChat] = useState([]);
    const [exportDialogOpen, toggleDialog] = useState(false);
  const [exportData, setExportThing] = useState(null);
  // const [darkMode, setDarkMode] = useState(false);
  const scrollRef = useRef(null); 
  const chatContainerRef = useRef(null); 
  const navigate = useNavigate();
  const theme = useTheme();
  
  // similar to actual terranova colour theme and home.js
  const lightPurple = '#ede7f6'; 
  const purpleMain = '#9E77ED'; 
  const darkPurple = '#7b1fa2';
  var light_mode_bg = '#ffffff';
  
  // console.log("QueryPage rendering - active file:", activeFile);
  
  // handle scrolling when new messages are added
  useEffect(() => { if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [msgs]);

  const grabFile = async () => {
    try {
      const response = await axios.get('/active-file');
      // Data format check
      // console.log("Active file response:", response);
      
      if (response.data && response.data.file) {
        setFile(response.data.file);
        setStuff(response.data.schema);
        console.log("Set active file:", response.data.file);
        console.log("Schema:", response.data.schema);
      }
    } catch (error) {
      console.error("Error fetching active file:", error);
    }
  };


  useEffect(() => {}, [])
  // Fetch active file when component loads
  useEffect(() => {
      console.log("queryPage mounted - fetching active file");
    grabFile();
    
    //todo:add proper cleanup
    return () => {
      console.log("QueryPage unmounting");
    };
  }, []);
  
  // scroll to bottom when msgs change
useEffect(() => {
    if (scrollRef && scrollRef.current) {
      setTimeout(() => { 
        // adding timeout fixed it (sometimes)
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    }
  }, [msgs])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs]);

  // send query to llm
  const sendQuery = async (query) => {
    console.log("submitting query:", query);
    
    if (!query.trim()) {
      console.log("Empty query");
      return;
    }
    if (!activeFile) {
      console.log("No active file, showing error");
      setErr('Please upload a file first');
      return;
    }

    isLoading(true);
    // Add user query to conversation
    const userMessage = { type: 'user', content: query };
    const updatedMsgs = [...msgs, userMessage];
    addChat(updatedMsgs);

    try {
      console.log("Sending POST request to /query endpoint");
      const response = await axios.post('/query', { query });
      console.log("query response:", response.data);
      
      if (response.data.success) {
        if (response.data.is_export) {
          console.log("Export request detected");
          const exportData = {
            results: response.data.results,
            columns: response.data.columns,
            query: query,
            queryType: response.data.query_type,
            timestamp: new Date()
          };
          
          // Add response to conversation
          addChat([
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
  
          setExportThing(exportData);
          toggleDialog(true);
        } else {
          console.log("regular query response with results");
          // Add the system response to updatedMsgs which already has the user message
          const systemResponse = {
              type: 'system', 
              content: '',
              queryType: response.data.query_type,
              queryCode: response.data.query_code,
              results: response.data.results,
              columns: response.data.columns
          };
          
          // Update state with user and system messages
          addChat([...updatedMsgs, systemResponse]);
        }
      } else {
        console.error("Query failed:", response.data.error);
        const errorMsg = response.data.error || 'An error occurred processing your query.';
        addChat([...updatedMsgs, { type: 'error', content: errorMsg }]);
      }
    } catch (err) {
      console.error("Query request error:", err);
      console.log("Should probably handle this error at some point");
      isLoading(false);
    } finally {
      isLoading(false);
    }
  };
  
  // Handle file upload selection
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      console.log("Selected file:", selectedFile.name);
    }
  };
  
  const openExportStuff = (data) => {
    setExportThing(data);
    toggleDialog(true);
  };
  
  const setSchema = () => {
    toggleDialog(false);
  };

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
            backgroundColor: light_mode_bg,
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
      // users input
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
      
      // response from system
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
            {message.content && (
              <Box style={{ padding: '16px' }}>
                <Typography>{message.content}</Typography>
              </Box>
            )}
            
            {/* show SQL code*/}
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
            
            {/* Show results if LLM works*/}
            {message.results && message.columns && (
              <Box style={{ width: '100%' }}>
                <QueryResults 
                  results={message.results} 
                  columns={message.columns} 
                  onExport={message.isExport ? null : openExportStuff}
                />
              </Box>
            )}
          </Box>
        </Box>
      );
    });
  };

  
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
                  setFile(null);
                }}
                sx={{ ml: 2 }}
              >
                Upload new
              </Button>
            </Box>
          </Alert>
        ) : (
          // File upload section
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
            <FileUpload onUploadSuccess={(fileInfo) => {
              console.log("New file uploaded:", fileInfo);
              setFile(fileInfo.filename);
              setStuff(fileInfo.schema);
              // reset previous chat
              addChat([]);
              console.log("Conversation cleared for new file");
            }} />
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
            onSubmit={sendQuery} 
            loading={loading} 
            disabled={!activeFile}
            // showSuggestions={true} 
          />
          
          {/* help text at the bottom*/}
          <Typography variant="caption" color="text.secondary" style={{ display: 'block', textAlign: 'center', marginTop: '16px' }}>
            Try asking "How many rows are in the file?" or "Show me the first 10 records"
          </Typography>
        </>
      )}
      
      { 
      exportDialogOpen ?  
      <ExportTemplatesDialog
        open={exportDialogOpen}
        onClose={setSchema}
        data={exportData?.results || []}
        columns={exportData?.columns || []}
        initialFormat="xlsx"
        initialTemplateType="basic"
      /> : null /* has to be here for some reason */}
    </Box>
  );
}
export default QueryPage;
