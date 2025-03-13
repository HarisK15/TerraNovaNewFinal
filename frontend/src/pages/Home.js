import React, { useEffect } from 'react';
import { Typography, Button, Box, Card, CardContent, Grid, alpha, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';

// This is the homepage of my dissertation project
// It shows an overview of what the app does and lets users navigate to the query page
function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Log when the home page loads
  useEffect(() => {
    console.log("Home page loaded");
    // TODO: Add analytics tracking later
    // TODO: Maybe add some animations to make it look nicer
  }, []);

  // Function to handle navigation to the query page
  const handleNavigateToQuery = () => {
    console.log("Navigating to query page...");
    navigate('/query');
  }
  
  return (
    <Box sx={{ py: 3 }}>
      {/* Main headline section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6,
          maxWidth: 800,
          mx: 'auto'
        }}
      >
        {/* Label chip */}
        <Chip 
          label="AI-Powered SQL Generation" 
          size="small" 
          sx={{ 
            mb: 3, 
            background: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 500,
            px: 1,
            '& .MuiChip-label': { px: 1 }
          }} 
        />
        
        {/* Main heading with gradient text */}
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            // I learned how to do gradient text from a tutorial
            background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.light} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          Query Your Data with Natural Language
        </Typography>
        
        {/* Subtitle */}
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          TerraNova helps you analyze and export data through natural language queries without needing to know SQL.
        </Typography>
        
        {/* CTA Button */}
        <Button 
          variant="contained" 
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleNavigateToQuery}
          sx={{ px: 4, py: 1.5 }}
        >
          Try It Now
        </Button>
      </Box>

      {/* Feature cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Feature 1 - Natural Language to SQL */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <ChatIcon />
              </Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Natural Language to SQL
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Just describe what you want to find in plain English, and our AI will convert it into SQL queries.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Feature 2 - Pre-built Exports */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <StorageIcon />
              </Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Export Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Export your data to CSV, Excel, or JSON with pre-built templates for reports and analysis.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Feature 3 - AI Analysis */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, p: 4 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <PsychologyIcon />
              </Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Data Insights
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Get automatic visualizations and statistical analysis of your query results.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload section */}
      <Box sx={{ 
        p: 4, 
        borderRadius: 4, 
        bgcolor: '#F9FAFB',
        border: '1px dashed',
        borderColor: 'divider',
        textAlign: 'center',
        mb: 0
      }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Upload Your Data
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Upload your CSV files to start querying. We support most standard CSV formats.
        </Typography>
        
        {/* File upload component */}
        <FileUpload />
        
        {/* Help message for data */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Don't have data? No problem - we have sample datasets you can use.
        </Typography>
      </Box>
    </Box>
  );
}

// Export the component so we can use it in App.js
export default Home;