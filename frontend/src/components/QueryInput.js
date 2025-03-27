import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Paper, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

// handles users questions
function QueryInput({ onSubmit, disabled, loading }) {
  // states
  const [query, setQuery] = useState('');
  const [chars, setChars] = useState(0);
  
  // Todo: add history of queries
  // runs when component loads
  useEffect(() => {
    console.log("input box ready");
    return () => {
    };
  }, []);
  
  
  
  const submitQuery = (e) => {
    e.preventDefault();
    
    if (query.trim() !== '') {
      onSubmit(query.trim());
      setQuery(''); 
      setChars(0);
    } else {
      console.log("empty query :/");
    }
  };
  
  const onType = (e) => {
    const val = e.target.value;
    setQuery(val);
    setChars(val.length);
  };

  // Todo: add validation for max length

  return (
    <Paper 
      component="form" 
      onSubmit={submitQuery} 
      elevation={2}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 2,
        border: '1px solid #e0e0e0'
      }}
    >
      {/* text box */}
      <TextField
        variant="outlined"
        placeholder="Ask a question about your data..."
        value={query}
        onChange={onType}
        fullWidth
        autoFocus
        disabled={disabled}
        InputProps={{
          sx: {
            borderRadius: 2
          }
        }}
      />
      
      {/* shows no of chars typed*/}
      <Box sx={{ mx: 1, color: '#888', fontSize: '0.75rem', minWidth: '40px' }}>
        {chars > 0 && `${chars}`}
      </Box>
      
      {/*send button */}
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
export default QueryInput;
