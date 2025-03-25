import React, { useEffect } from 'react';
import { Typography, Button, Box, Card, CardContent, Grid, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';
// import Footer from '../components/Footer'

// homepage
// maybe add dark mode

function Home() {
  var nav = useNavigate();
  const theme = useTheme();
    //colours to use
  const btn_colour = 'primary'
  // testing
var isDebug = false;


  // common purple colors for consistency
  let lightPurple = '#ede7f6'; 
  let mainPurple = '#9c27b0';  
  let darkPurple = '#7b1fa2';  

  useEffect(() => {
    console.log("Home page loaded")
    var page_title = document.title
    console.log('current page: ' + page_title)
    //fix this part
  }, []);


  // function openSettings() {
    //   pass
    // }

// go to next page
  function navQuery() {
    console.log("going to query page...")
    nav('/query');
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* top part */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 5,
          maxWidth: 750,
          mx: 'auto'
        }}
      >
        <Chip 
          label="AI-Powered SQL Generation" 
          size="small" 
          sx={{ 
            mb: 3, 
            background: lightPurple,
            color: darkPurple,
            fontWeight: 500,
            px: 1.5,
            '& .MuiChip-label': { px: 1 }
          }} 
        />
        
        {/* title */}
        <Typography 
          variant="h3" 
          component="h1" 
          style={{ 
            fontWeight: 700,
            marginBottom: '16px',
            color: '#9E77ED'
            // add gradient
      
          }}
        >
          Query Your Data with Natural Language
        </Typography>
        
        {/* subtitle description */}
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3.5, maxWidth: 580, mx: 'auto', lineHeight: 1.5 }}
        >
          TerraNova helps you analyze and export data through natural language queries without needing to know SQL.
        </Typography>
        


        {/* button */}
        <Button 
          variant="contained" 
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={navQuery}
          sx={{ px: 3.5, py: 1.2 }}
        >
          Try It Now
        </Button>
      </Box>


      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* card 1 */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ flexGrow: 1, py: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: lightPurple,
                  color: '#9E77ED',
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
        <Grid item xs={12} md={3.5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  backgroundColor: lightPurple,
                  color: '#9E77ED',
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
        
        
        
        {/* card 3*/}
        <Grid item xs={12} md={3.5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ flexGrow: 1, p: 3.5 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 1.5,
                  backgroundColor: lightPurple,
                  color: '#9E77ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5
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

      {/* upload section */}
      <Box sx={{ 
        maxWidth: '100%', 
        p: 3, 
        borderRadius: 2,
        background: '#ffffff', 
        borderLeft: '4px solid ' + mainPurple,
        mb: 4,
      }}>
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
          Upload Your Data File
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Supported formats: CSV, SQLite DB files
        </Typography>
        
        <FileUpload />
      </Box>
      


      {/* footer note */}
      <Box sx={{ textAlign: 'center', mt: 6, opacity: 0.7 }}>
        <Typography variant="body2" color="text.secondary">
          KCL | TerraNova | Haris Kamran | 2025
        </Typography>
      </Box>
    </Box>
  );
}
export default Home;