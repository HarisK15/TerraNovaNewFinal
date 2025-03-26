import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Navigate } from 'react-router-dom'; // maybe needed later?
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

//Material UI components
import {
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Button, 
  IconButton
  // TextField 
} from '@mui/material';

// MUI icons
import TerminalIcon from '@mui/icons-material/Terminal';
import MenuIcon from '@mui/icons-material/Menu';
// import SettingsIcon from '@mui/icons-material/Settings'; 
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode'; 
import { Link } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import QueryPage from './pages/QueryPage';
// import AboutPage from './pages/About'; 
// const SettingsPage = lazy(() => import('./pages/Settings'));
import axios from 'axios';

// Colours - allign with theme later!
let MainCol = '#7F56D9';  
  let SecondCol = '#F670C7';  
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: MainCol,
      light: '#9E77ED',
      dark: '#6941C6', 
    },
    secondary: {
    main: SecondCol,  
      light: '#FDA7DF',
      dark: '#E64BB5',
    },
    background: {
      default: '#FAFAFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#101828',
      secondary: '#667085',
    },
  },
  typography: {
    fontFamily: '"-apple-system", "BlinkMacSystemFont", "Inter", "Roboto", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: {
      fontWeight: 500,
      textTransform: 'none'
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
          boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)'
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
            boxShadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
            backgroundColor: 'primary.light'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)',
          color: 'white'
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


function MyApp() {
  console.log('App is rendering...');
  
  // experimenting with state



  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(127, 86, 217, 0.02) 0%, rgba(255, 255, 255, 0) 100%)'
          }}
        >
          {/* AppBar */}
          <AppBar position="static" elevation={0}>
            <Toolbar style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: MainCol,
                  marginRight: 16,
                  padding: 4,
                  borderRadius: 4
                }}
              >
                <TerminalIcon style={{ fontSize: 28 }} />
              </Box>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                style={{
                  fontWeight: 700,
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: '#101828'
                }}
              >
                Terranova
              </Typography>
                <Button
                  color="primary"
                  variant="contained"
                  component={Link}
                  to="/query"
                  sx={{ ml: 2, mt: 0.25 }}
                >
                  Go to Query
                </Button>
            </Toolbar>
          </AppBar>

          {/* Main content */}
          <Container maxWidth="lg" style={{ marginTop: 32, marginBottom: 32 }}>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/query" element={<QueryPage />} />
              {/* <Route path="/about" element={<AboutPage />} /> */}
              {/* <Route path="/settings" element={<SettingsPage />} /> */}
            </Routes>
          </Container>

          {/* bottom */}
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
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                style={{ fontSize: '14px' }}
              >
                Terranova &copy; {new Date().getFullYear()}
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

console.log('Exporting components');
export default MyApp;

// const defaultSettings = {
//   darkMode: false,
// };

// TODO:
// - Add dark mode toggle
// - Set up auth
// - Make settings page work
