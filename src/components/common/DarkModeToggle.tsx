import { FC } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * A toggle button for switching between light and dark mode
 */
export const DarkModeToggle: FC = () => {
  const { mode, toggleMode } = useTheme();
  
  return (
    <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size="small"
        sx={{
          bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          },
          borderRadius: '50%',
        }}
      >
        {mode === 'light' ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
}; 