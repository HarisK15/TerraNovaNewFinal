import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// This component handles the input field for user queries
// It takes the query from the user and sends it to the parent component
function QueryInput({ onSubmit, disabled, loading }) {
  const [query, setQuery] = useState('');
  const [charCount, setCharCount] = useState(0);
  
  // Log when component mounts
  useEffect(() => {
    console.log("QueryInput component mounted");
    return () => {
      console.log("QueryInput component unmounted");
    };
  }, []);
  
  // This function handles when the user submits a query
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Query submitted:", query);
    
    if (query.trim() !== '') {
      onSubmit(query.trim());
      setQuery(''); // Clear the input field after submission
      setCharCount(0); // Reset character count
      console.log("Input field cleared after submission");
    } else {
      console.log("Empty query, not submitting");
    }
  };
  
  // This updates the character count when query changes
  const handleQueryChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setCharCount(newValue.length);
    console.log("Query updated, char count:", newValue.length);
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit} 
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 2,
        // Adding a border for better visibility
        border: '1px solid #e0e0e0'
      }}
    >
      {/* Text input for the query */}
      <TextField
        variant="outlined"
        placeholder="Ask a question about your data..."
        value={query}
        onChange={handleQueryChange}
        fullWidth
        autoFocus
        disabled={disabled}
        // Simple styling for the input field
        InputProps={{
          sx: {
            borderRadius: 2
          }
        }}
      />
      
      {/* Character count display */}
      <Box sx={{ mx: 1, color: '#888', fontSize: '0.75rem', minWidth: '40px' }}>
        {charCount > 0 && `${charCount}`}
      </Box>
      
      {/* Submit button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
        disabled={!query.trim() || disabled || loading}
        sx={{ ml: 1, px: 2, py: 1, borderRadius: 2 }}
      >
        Send
      </Button>
    </Paper>
  );
}

// Export the component so it can be used in other files
export default QueryInput;