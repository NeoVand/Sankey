import { FC, useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  InputAdornment,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  ClickAwayListener,
  Popper,
  Fade
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { searchCompaniesByTicker } from '../../services/api/companyApi';
import { CompanyInfo } from '../../types/company';
import { ErrorDisplay } from '../common/ErrorDisplay';

interface CompanySearchProps {
  onSelectCompany: (company: CompanyInfo) => void;
  compact?: boolean;
}

/**
 * Modern dropdown search component for companies
 */
export const CompanySearch: FC<CompanySearchProps> = ({ 
  onSelectCompany,
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  const anchorRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking away
  const handleClickAway = () => {
    setOpen(false);
  };
  
  // Handle search function
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setOpen(true);
      const results = await searchCompaniesByTicker(searchTerm);
      setSearchResults(results);
      
      if (results.length === 0) {
        setError(`No companies found with ticker "${searchTerm}"`);
      }
    } catch (err) {
      console.error('Error searching companies:', err);
      setError('Failed to search for companies. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };
  
  // Handle company selection
  const handleSelectCompany = (company: CompanyInfo) => {
    onSelectCompany(company);
    setSearchTerm('');
    setOpen(false);
    setSearchResults([]);
  };
  
  // Auto-search when typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box 
        ref={anchorRef}
        sx={{ 
          position: 'relative',
          width: compact ? '100%' : '100%',
          maxWidth: compact ? '100%' : 600,
          mx: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <TextField
          fullWidth
          size={compact ? "small" : "medium"}
          placeholder={compact ? "Search company..." : "e.g. AAPL, MSFT, GOOGL"}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onClick={() => searchTerm.length >= 2 && setOpen(true)}
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: isLoading && (
              <InputAdornment position="end">
                <CircularProgress size={20} color="inherit" />
              </InputAdornment>
            ),
            sx: compact ? { 
              height: '28px', 
              fontSize: '0.85rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              }
            } : {}
          }}
          sx={{ 
            mb: compact ? 0 : 1,
            '& .MuiInputBase-root': {
              background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            }
          }}
        />
        
        <Popper
          open={open && (searchResults.length > 0 || error !== null)}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          transition
          style={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper elevation={3} sx={{ mt: 0.5, maxHeight: 350, overflow: 'auto' }}>
                {error ? (
                  <Box sx={{ p: 2 }}>
                    <ErrorDisplay message={error} />
                  </Box>
                ) : (
                  <List sx={{ py: 0 }}>
                    {searchResults.map((company) => (
                      <ListItem key={company.cik} disablePadding>
                        <ListItemButton onClick={() => handleSelectCompany(company)}>
                          <ListItemText 
                            primary={`${company.ticker} - ${company.name}`}
                            secondary={`CIK: ${company.cik}`}
                            primaryTypographyProps={{ 
                              fontWeight: 'medium',
                              variant: compact ? 'body2' : 'body1' 
                            }}
                            secondaryTypographyProps={{ 
                              variant: compact ? 'caption' : 'body2' 
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}; 