import { FC } from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

/**
 * A reusable error display component
 */
export const ErrorDisplay: FC<ErrorDisplayProps> = ({ 
  title = 'Error', 
  message, 
  onRetry 
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Alert 
        severity="error"
        icon={<ErrorIcon />}
        action={
          onRetry ? (
            <Button 
              color="inherit" 
              size="small" 
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
}; 