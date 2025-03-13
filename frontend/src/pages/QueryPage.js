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
import axios from 'axios';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StorageIcon from '@mui/icons-material/Storage';
import QueryInput from '../components/QueryInput';
import QueryResults from '../components/QueryResults';
import FileUpload from '../components/FileUpload';
import ExportTemplatesDialog from '../components/ExportTemplatesDialog';
import { useNavigate } from 'react-router-dom';

// This is the main query page component where users can talk to their data
// It allows uploading files, asking questions, and viewing results
function QueryPage() {
  // State variables to store all our data
  const [activeFile, setActiveFile] = useState(null);
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState(null);
  const chatEndRef = useRef(null); // This is for auto-scrolling to the bottom
  const navigate = useNavigate();
  const theme = useTheme();
  
  console.log("QueryPage rendering - active file:", activeFile);
  
  // Fetch active file when component loads
  useEffect(() => {
    console.log("QueryPage mounted - fetching active file");
    fetchActiveFile();
    
    // Cleanup function 
    return () => {
      console.log("QueryPage unmounting...");
      // TODO: Add more cleanup logic later
    };
  }, []);

  // Auto-scroll to bottom of chat when conversation updates
  useEffect(() => {
    console.log("Conversation updated, scrolling to bottom");
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Function to get the active file from the backend
  const fetchActiveFile = async () => {
    console.log("Fetching active file...");
    try {
      setLoading(true);
      const response = await axios.get('/active-file');
      console.log("Active file response:", response.data);
      
      if (response.data.success) {
        setActiveFile(response.data.file);
        setSchema(response.data.schema);
        console.log("Set active file:", response.data.file);
        console.log("Schema:", response.data.schema);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching active file:", err);
      setError('No active file found. Please upload a file first.');
      setLoading(false);
    }
  };

  // This function handles sending the query to the backend
  const submitQuery = async (query) => {
    console.log("Submitting query:", query);
    
    if (!query.trim()) {
      console.log("Empty query, not submitting");
      return;
    }

    if (!activeFile) {
      console.log("No active file, showing error");
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    // Add user query to conversation
    setConversation(prevConversation => [
      ...prevConversation,
      { type: 'user', content: query }
    ]);

    try {
      console.log("Sending POST request to /query endpoint");
      const response = await axios.post('/query', { query });
      console.log("Query response:", response.data);
      
      if (response.data.success) {
        // Check if this is an export intent
        if (response.data.export_intent) {
          console.log("Export intent detected");
          setExportData({
            results: response.data.results,
            columns: response.data.columns,
            exportFormat: response.data.export_format,
            exportTemplateType: response.data.export_template_type,
            intent: response.data.export_intent
          });
          
          // Add the response to conversation
          setConversation(prevConversation => [
            ...prevConversation,
            { 
              type: 'system', 
              content: 'I\'ll prepare your export with the requested data.', 
              queryType: response.data.query_type || 'sql',
              queryCode: response.data.query_code || response.data.sql_query,
              results: response.data.results,
              columns: response.data.columns,
              exportIntent: response.data.export_intent,
              exportFormat: response.data.export_format,
              exportTemplateType: response.data.export_template_type,
              isExport: true
            }
          ]);
          
          // Open the export dialog automatically
          setExportDialogOpen(true);
        } else {
          // Regular query response (not an export)
          console.log("Regular query response with results");
          setConversation(prevConversation => [
            ...prevConversation,
            { 
              type: 'system', 
              content: '', // No explanation - just showing data
              queryType: response.data.query_type || 'sql',
              queryCode: response.data.query_code || response.data.sql_query, // Support both new and old API responses
              results: response.data.results,
              columns: response.data.columns
            }
          ]);
        }
      } else {
        // Add error message to conversation
        console.error("Query failed:", response.data.error);
        setConversation(prevConversation => [
          ...prevConversation,
          { type: 'error', content: response.data.error || 'An error occurred processing your query.' }
        ]);
      }
    } catch (err) {
      // Add error message to conversation
      console.error("Query request error:", err);
      setConversation(prevConversation => [
        ...prevConversation,
        { type: 'error', content: err.response?.data?.error || 'An error occurred processing your query.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // This is called when a new file is uploaded
  const handleNewFileUploaded = (fileInfo) => {
    console.log("New file uploaded:", fileInfo);
    setActiveFile(fileInfo.filename);
    setSchema(fileInfo.schema);
    // Clear previous conversation when a new file is uploaded
    setConversation([]);
    console.log("Conversation cleared for new file");
  };

  // This function opens the export dialog
  const handleOpenExportDialog = (data) => {
    console.log("Opening export dialog with data:", data);
    setExportData(data);
    setExportDialogOpen(true);
  };

  // This function closes the export dialog
  const handleCloseExportDialog = () => {
    console.log("Closing export dialog");
    setExportDialogOpen(false);
  };

  // Function to render the chat messages
  const renderChatMessages = () => {
    if (conversation.length === 0) {
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8,
            px: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderRadius: 4,
            border: '1px dashed',
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.5), mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
            Ask a question about your data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 450 }}>
            Try asking questions like "How many rows are in this file?" or "Show me the first 10 records"
          </Typography>
        </Box>
      );
    }

    return conversation.map((message, index) => {
      // This is the message from the user
      if (message.type === 'user') {
        return (
          <Box key={index} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box sx={{ display: 'flex', maxWidth: '80%' }}>
              <Box 
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.text.primary,
                  borderRadius: '12px 12px 0 12px',
                  p: 2,
                  mr: 1,
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.9),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <PersonIcon sx={{ fontSize: 18 }} />
              </Box>
            </Box>
          </Box>
        );
      }
      
      // This is an error message
      if (message.type === 'error') {
        return (
          <Box key={index} sx={{ display: 'flex', mb: 3 }}>
            <Box 
              sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: theme.palette.error.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mr: 1
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box 
              sx={{ 
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                borderRadius: '12px 12px 12px 0',
                p: 2,
                maxWidth: '80%'
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
            </Box>
          </Box>
        );
      }
      
      // This is the response from the system
      return (
        <Box key={index} sx={{ display: 'flex', mb: 4 }}>
          <Box 
            sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              mr: 1,
              flexShrink: 0
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box 
            sx={{ 
              bgcolor: 'white',
              borderRadius: 3,
              p: 0,
              width: '100%',
              boxShadow: `0px 2px 8px ${alpha('#000', 0.05)}`
            }}
          >
            {/* Only show the content message if there is one */}
            {message.content && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            )}
            
            {/* Only show SQL code if it exists */}
            {message.queryCode && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderTop: message.content ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                borderBottom: message.results?.length > 0 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip 
                    label={message.queryType === 'sql' ? 'SQL Query' : 'Query'} 
                    size="small" 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }} 
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    m: 0,
                    p: 1,
                    bgcolor: alpha('#000', 0.03),
                    borderRadius: 1,
                    color: alpha(theme.palette.text.primary, 0.8),
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
              <Box sx={{ width: '100%' }}>
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

  return (
    <Box sx={{ maxWidth: '1000px', mx: 'auto', px: 3, py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
          }}
        >
          <ChatIcon 
            sx={{ 
              fontSize: 36, 
              mr: 2,
              color: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.1),
              p: 1,
              borderRadius: '50%',
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
            }}
          >
            Chat with your Data
          </Typography>
        </Box>
        
        {/* Show file info if we have an active file */}
        {activeFile ? (
          <Alert 
            icon={false}
            severity="info" 
            sx={{ 
              mb: 2, 
              width: '100%', 
              maxWidth: 600,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              color: 'text.primary'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StorageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  Active file: <strong>{activeFile}</strong>
                </Typography>
              </Box>
              <Button 
                size="small" 
                onClick={() => {
                  console.log("Upload new file button clicked");
                  setActiveFile(null);
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
            sx={{ 
              p: 4, 
              mb: 4, 
              width: '100%',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.02)
            }}
          >
            <Typography variant="h6" gutterBottom>
              Upload a file to get started
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
            sx={{ 
              mb: 3, 
              maxHeight: '60vh',
              overflowY: 'auto',
              p: 2,
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.8),
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5)
            }}
          >
            {renderChatMessages()}
            <div ref={chatEndRef} />
          </Box>

          {/* Input box */}
          <QueryInput 
            onSubmit={submitQuery} 
            loading={loading} 
            disabled={!activeFile}
          />
          
          {/* Small help text at the bottom */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
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

// Export the component so it can be imported in App.js
export default QueryPage;