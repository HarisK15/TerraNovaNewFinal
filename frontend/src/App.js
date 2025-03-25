import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import HomeIcon from '@mui/icons-material/Home'; 
import { Link } from 'react-router-dom';
import DarkModeIcon from '@mui/icons-material/DarkMode'; 

 
// Import pages
import Home from './pages/Home';
import QueryPage from './pages/QueryPage';
// import AboutPage from './pages/About'; 

// still figuring out the best color scheme
// colours need to clean these up later
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7F56D9', 
      light: '#9E77ED',
      dark: '#6941C6',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#F670C7',  
      light: '#FDA7DF',
      dark: '#E64BB5',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFF',  
      paper: '#FFFFFF'
    },
    text: {
      primary: '#101828',
      secondary: '#667085'
    },
    divider: 'rgba(0, 0, 0, 0.08)'
  },
  typography: {
    fontFamily: '"-apple-system", "BlinkMacSystemFont", "Inter", "Roboto", sans-serif',
    h1: { 
      fontWeight: 700 
    },
    h2: { 
      fontWeight: 700 
    },
    h3: { 
      fontWeight: 600 
    },
    h4: { 
      fontWeight: 600 
    },
    h5: { 
      fontWeight: 500 
    },
    h6: { 
      fontWeight: 500 
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 12
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
    '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    ...Array(20).fill('none')
  ],
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#101828',
          boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { 
          borderRadius: 8,
          padding: '10px 18px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    }
  }
});

// trying to add loading state but not using it yet
// const [isLoading, setIsLoading] = useState(false)
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          background: 'linear-gradient(180deg, rgba(127, 86, 217, 0.02) 0%, rgba(255, 255, 255, 0) 100%)'
        }}>
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  mr: 2, 
                  p: 0.5, 
                  borderRadius: 1
                }}
              >
                <TerminalIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography 
                variant="h6" 
                component={Link} 
                to="/"
                sx={{ 
                  fontWeight: 700, 
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'text.primary',
                }}
              >
                TerraNova
              </Typography>
              <Button 
                color="primary" 
                variant="contained" 
                component={Link} 
                to="/query"
                sx={{ ml: 2 }}
              >
                Go to Query
              </Button>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/query" element={
                <QueryPage />} />
            </Routes>
          </Container>
          

          <Box 
            component="footer" 
            sx={{ 
              py: 3, 
              px: 2, 
              mt: 'auto', 
              textAlign: 'center',
              borderTop: '1px solid',
              borderColor: 'divider',
              backgroundColor: '#FFFFFF'
            }}
          >
            <Container maxWidth="sm">
              <Typography variant="body2" color="text.secondary" align="center">
                TerraNova &copy; {new Date().getFullYear()}
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

// const defaultSettings = {
//   darkMode: false,
//   fontSize: 'medium',
//   notifications: true
// }

// function getVersion() {
//   // Need to figure out how to get this from package.json
//   // pass
// }

//notification feature
// function showNotification(message) {
//   if (!("Notification" in window)) {
//     console.log("This browser doesn't support notifications");
//   } else if (Notification.permission === "granted") {
//     const notification = new Notification("TerraNova", {
//       body: message,
//     });
//   } else {
//     console.log("No notification permission");
//   }
// }

// console.log("App.js loaded!");  

// Need to implement this function - shows warning when user tries to leave
// window.addEventListener("beforeunload", function(e) {
//   pass
// });