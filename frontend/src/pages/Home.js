import React, { useEffect } from 'react';
import { Typography, Button, Box, Card, CardContent, Grid, alpha, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';

// my dissertation homepage
// TODO: maybe add dark mode?? need to check how to do this

function Home() {
  var nav = useNavigate();
  const theme = useTheme();
  
    // some colors I might use later
  const btn_color = 'primary'
  
  // this is for testing
var isDebug = false;


  // log stuff when page loads
  useEffect(() => {
    console.log("Home page loaded")
    // stuff to add later
    // TODO analytics here??
    
    var page_title = document.title
    console.log('current page: ' + page_title)
    
    //TODO fix this part

  }, []);

  // go to query page
  function navQuery() {
    console.log("going to query page...")
    nav('/query');
  }
  

  return (
    <Box sx={{ py: 3 }}>
      {/* top part */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6,
          maxWidth: 800,
          mx: 'auto'
        }}
      >

        {/* chip with label */}
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
        
        
        {/* title */}
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            // gradient text from stackoverflwo
            background: `linear-gradient(120deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.secondary.light} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
          }}
        >
          Query Your Data with Natural Language
        </Typography>
        
        {/* subtitle description */}
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
        >
          TerraNova helps you analyze and export data through natural language queries without needing to know SQL.
        </Typography>
        

        {/* button */}
        <Button 
          variant="contained" 
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={navQuery}
          sx={{ px: 4, py: 1.5 }}
        >
          Try It Now
        </Button>
      </Box>



      {/* cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        
        {/* card 1 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
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
        
        
        
        {/* card 2 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
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
        
        
        
        {/* card 3 - data insights */}
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
              
              {/* TODO add more features here */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      
      {/* upload area */}
      <Box sx={{ 
        p: 3, 
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
        
        {/* upload component */}
        <FileUpload />
      </Box>
    </Box>
  );
}

// TODO fix margin on mobile
// TODO add footer?


export default Home;