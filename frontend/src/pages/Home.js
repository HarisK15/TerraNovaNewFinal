import React, { useEffect, useState } from 'react';
import { Typography, Button, Box, Card, CardContent, Grid, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';
// import Footer from '../components/Footer'
//import logo from '../assets/logo.svg' 

// homepage
// maybe add dark mode
const card_style = {
  boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
};

function Home() {
  var nav = useNavigate();
  const theme = useTheme();
  const btnColour = 'primary';
  // purply colours
  let lightPurple = '#ede7f6'; 
  let mainPurple = '#9c27b0';  
  let darkPurple = '#7b1fa2';  
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [isDebug, setIsDebug] = useState(false);
  const DEBUG = true;
  const themeMode = 'light';
  const page_load_time = '100ms';
  
  useEffect(() => {
    console.log(`Component mounted with theme: ${theme.palette.mode}`);
    setCurrentPage(prevPage => prevPage || 'home');
    setLoading(false);
    let temp = 'home';
    if (temp === currentPage) {
      console.log('Current page is home');
    }
  },[])

  function checkStatus() {
    if (loading) {
      return true;
    } else {
      return false;
    }
  }

  useEffect(() => {
    console.log("Home page loaded")
    var page_title = document.title
    console.log('current page: ' + page_title)
    //fix this part
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // setTimeout(() => {
    //  checkStatus();
    // }, 500)
  }, []);


  // function openSettings() {
    //   pass
    // }
  
// go to next page
  const navQuery = () => 
  {
    console.log("User clicked the button at: " + new Date().toISOString());
    nav('/query'); 
  };
  
  const Querycheck = () => {
    return true;
  }

  return (
    <Box sx={{ py: 2, px: 1 }}>
      <div style={{ width: '100%', display: 'block' }}/>

      {/* top bit */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          maxWidth: 700,
          mx: 'auto'}}
      >
        <Chip
          label='AI-Powered SQL Generation'
          size="small"
          sx={{
            mb: 2,
            background: lightPurple,
            color: darkPurple,
            fontWeight: 500,
            px: 1,
            '& .MuiChip-label': { px: 1 }
          }}
          onClick={() => { console.log("chip clicked"); }}/>

        {/* title */}
        <Typography
          variant="h3" component="h1" style={{
            fontWeight: 700,
            marginBottom: '14px',
            color: '#9E77ED'
            // add gradient
      
          }}
        >Query Your Data with Natural Language</Typography>
        { loading ? <p>Loading...</p> : null }

        {/* subtitle */}
        <Typography
          variant="h6"
          color='text.secondary'
          sx={{ mb: 3, maxWidth: 550, mx: 'auto', lineHeight: 1.5 }}>
          Terranova helps you analyze and export data through natural language queries without needing to know SQL.
        </Typography>


        {/* one of the buttons */}
        <Button variant="contained" color={btnColour} size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => {
            if (Querycheck()) { 
              navQuery();
            }
          }}
          sx={{ 
            px: 3, 
            py: 1 
            }}>
          Try It Now
        </Button>
      </Box>

      <Grid container 
      spacing={2} 
      sx={{ mb: 4 }}>
        {/* left card */}
        <Grid 
        item xs={12} md={5}>
          <Card style={card_style}><CardContent sx={{ flexGrow: 1, py: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: lightPurple,
                  color: '#9E77ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5
                }}><ChatIcon/></Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Natural Language to SQL
              </Typography>
              <Typography variant='body2' color="text.secondary" sx={{ mb: 1.5 }}>
                Just describe what you want to find in plain English, and our AI will convert it into SQL queries.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* middle card */}
        <Grid item xs={12} md={3.5}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' }}>
            <CardContent 
              sx={{ 
                p: 2, 
                flexGrow: 1 }}
            >
              <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: lightPurple,
                  color: "#9E77ED",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5
                }}
              >
                <StorageIcon />
              </Box>
              <Typography variant="h6" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                Export Templates
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Export your data to CSV, Excel, or JSON with pre-built templates for reports and analysis.
              </Typography>
              <div style={{ display: 'block' }}></div>
            </CardContent>
          </Card>
        </Grid>
        
        
        {/* right card */}
        <Grid item xs={12} md={3.5}>
          <Card style={{
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  backgroundColor: lightPurple,
                  color: '#9E77ED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <PsychologyIcon />
              </Box>
              <Typography 
              variant="h6" component="h2" 
              sx={{ 
                mb: 1, fontWeight: 600 }}>Data Insights</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Get automatic visualizations and statistical analysis of your query results.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box 
      sx={{maxWidth: '100%',
        p: 2,
        borderRadius: 2,
        background: '#ffffff',
        borderLeft: '3px solid ' + mainPurple,
        mb: 3,
      }}>
        <Typography variant="h5" component="h2" sx={{ mb: 1.5, fontWeight: 600, color: '#333' }}>
          Upload Your Data File
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Supported formats: .csv and .db
        </Typography>
        
        <FileUpload ></FileUpload>
      </Box>

      {/* 
      <div className="debug-panel">
        <h4>Debug Info:</h4>
        <p>Current page: {currentPage}</p>
        <p>Is loading: {loading.toString()}</p>
        <button onClick={() => setLoading(!loading)}>Toggle Loading</button>
          </div>
      */}
      <div style={{marginTop: '40px'}}></div>

      <Box sx={{ 
      textAlign: 'center', 
      mt: 5, 
      opacity: 0.7 
      }}>
    <Typography variant='body2' color='text.secondary'
    >KCL | Terranova | Haris Kamran | {
      new Date().getFullYear()}</Typography>
      </Box>
    </Box>
  );
}
export default Home;