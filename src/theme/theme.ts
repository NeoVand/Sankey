import { createTheme, PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode colors
            primary: {
              main: '#2e7d32', // Green color for financial theme
              light: '#4caf50',
              dark: '#1b5e20',
            },
            secondary: {
              main: '#1976d2', // Blue
              light: '#42a5f5',
              dark: '#1565c0',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121',
              secondary: '#757575',
            },
          }
        : {
            // Dark mode colors
            primary: {
              main: '#4caf50', // Brighter green for dark mode
              light: '#6fbf73',
              dark: '#357a38',
            },
            secondary: {
              main: '#42a5f5', // Brighter blue for dark mode
              light: '#80d6ff',
              dark: '#0077c2',
            },
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0bec5',
            },
          }),
    },
    typography: {
      fontFamily: [
        'Roboto',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: '#6b6b6b #2b2b2b',
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              backgroundColor: mode === 'light' ? '#f5f5f5' : '#2b2b2b',
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              backgroundColor: mode === 'light' ? '#bdbdbd' : '#6b6b6b',
              minHeight: 24,
            },
          },
        },
      },
    },
  });
}; 