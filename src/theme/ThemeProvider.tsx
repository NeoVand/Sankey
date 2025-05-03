import { FC, ReactNode, createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';

// Color schemes that work well for both light and dark modes
const lightPalette = {
  primary: {
    main: '#2563eb', // Brighter blue
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#fff'
  },
  secondary: {
    main: '#0ea5e9', // Bright cyan
    light: '#7dd3fc',
    dark: '#0284c7',
    contrastText: '#fff'
  },
  background: {
    default: '#f8fafc', // Very light blue-gray
    paper: '#ffffff'
  },
  text: {
    primary: '#0f172a',
    secondary: '#475569'
  }
};

const darkPalette = {
  primary: {
    main: '#e2e8f0', // Light gray instead of blue
    light: '#f1f5f9',
    dark: '#94a3b8',
    contrastText: '#000'
  },
  secondary: {
    main: '#94a3b8', // Medium gray instead of cyan
    light: '#cbd5e1',
    dark: '#64748b',
    contrastText: '#000'
  },
  background: {
    default: '#000000', // Pure black background
    paper: '#121212'    // Very dark gray for paper elements
  },
  text: {
    primary: '#f1f5f9', // Light gray text
    secondary: '#94a3b8'  // Medium gray for secondary text
  }
};

interface ThemeContextProps {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  mode: 'light',
  toggleMode: () => {}
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  // Get theme preference from local storage
  const [mode, setMode] = useState<PaletteMode>(() => {
    const storedMode = localStorage.getItem('themeMode');
    return (storedMode as PaletteMode) || 'light';
  });
  
  // Toggle theme mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  // Store theme preference in local storage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);
  
  // Create theme based on mode
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette)
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
              : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
            backgroundImage: 'none'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(mode === 'dark' && {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)'
            })
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: '6px'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`
          }
        }
      }
    },
    shape: {
      borderRadius: 8
    }
  }), [mode]);
  
  const contextValue = useMemo(() => ({
    mode,
    toggleMode
  }), [mode]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 