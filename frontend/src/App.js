import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Link } from 'react-router-dom';

// Import the pages for our app
import Home from './pages/Home';
import QueryPage from './pages/QueryPage';

// Setting up a theme for the app
// I found these colors online and thought they looked nice
console.log("Creating app theme...");
const theme = createTheme({
  // Color palette
  palette: {
    mode: 'light',
    primary: {
      main: '#7F56D9',  // Purple color
      light: '#9E77ED',
      dark: '#6941C6',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#F670C7',  // Pink color
      light: '#FDA7DF',
      dark: '#E64BB5',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAFAFF',  // Off-white
      paper: '#FFFFFF'
    },
    text: {
      primary: '#101828',
      secondary: '#667085'
    },
    divider: 'rgba(0, 0, 0, 0.08)'
  },
  // Typography settings
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
      textTransform: 'none',
    }
  },
  // Border radius for components
  shape: {
    borderRadius: 12
  },
  // Simplified shadows
  shadows: [
    'none',
    '0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)',
    '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
    '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
    '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
    ...Array(20).fill('none')
  ],
  // Simple component overrides
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 18px',
          fontWeight: 500,
          boxShadow: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #7F56D9 0%, #9E77ED 100%)'
        }
      }
    }
  }
});

// Main App component
function App() {
  // Log when the app renders
  useEffect(() => {
    console.log("App component rendered");
    console.log("Current theme:", theme);
    
    // Check if we're in development or production
    if (process.env.NODE_ENV === 'development') {
      console.log("Running in development mode");
    } else {
      console.log("Running in production mode");
    }
    
    // Log the current date for debugging
    console.log("App started at:", new Date().toLocaleString());
    
    // TODO: Add more app-wide settings and configurations
    // TODO: Implement dark mode toggle
    // TODO: Add error boundary
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {/* Main container with gradient background */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          background: 'linear-gradient(180deg, rgba(127, 86, 217, 0.02) 0%, rgba(255, 255, 255, 0) 100%)'
        }}>
          {/* App header/navbar */}
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              {/* Logo icon */}
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
              
              {/* App title */}
              <Typography 
                variant="h6" 
                component={Link} 
                to="/"
                sx={{ 
                  fontWeight: 700, 
                  flexGrow: 1,
                  textDecoration: 'none',
                  color: 'text.primary',
                  letterSpacing: '-0.01em'
                }}
              >
                TerraNova
              </Typography>
              
              {/* Navigation button */}
              <Button 
                color="primary" 
                variant="contained" 
                component={Link} 
                to="/query"
                sx={{ ml: 2 }}
                onClick={() => console.log("Navigate to Query page")}
              >
                Go to Query
              </Button>
            </Toolbar>
          </AppBar>
          
          {/* Main content area */}
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/query" element={<QueryPage />} />
            </Routes>
          </Container>
          
          {/* Footer */}
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
                TerraNova &copy; {new Date().getFullYear()} - KCL University Project
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;