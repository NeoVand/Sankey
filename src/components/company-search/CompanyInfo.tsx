import { FC } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip, 
  Link, 
  Button,
  Grid
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  Link as LinkIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';
import { CompanyInfo as CompanyInfoType, CompanyFilingInfo } from '../../types/company';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorDisplay } from '../common/ErrorDisplay';

interface CompanyInfoProps {
  company: CompanyInfoType | null;
  filings: CompanyFilingInfo[];
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
  onSelectFiling: (filing: CompanyFilingInfo) => void;
  onLoadFinancials: () => void;
}

/**
 * Component for displaying selected company information and filings
 */
export const CompanyInfo: FC<CompanyInfoProps> = ({
  company,
  filings,
  isLoading,
  error,
  onReset,
  onSelectFiling,
  onLoadFinancials
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Loading company information..." />;
  }
  
  if (error) {
    return (
      <Box sx={{ mb: 3 }}>
        <ErrorDisplay 
          title="Error Loading Company" 
          message={error} 
        />
        <Button 
          startIcon={<ResetIcon />}
          variant="outlined"
          onClick={onReset}
          sx={{ mt: 2 }}
        >
          Reset
        </Button>
      </Box>
    );
  }
  
  if (!company) {
    return null;
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {company.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1">
              <strong>Ticker:</strong> {company.ticker}
              {company.exchange && ` (${company.exchange})`}
            </Typography>
            <Chip 
              label={`CIK: ${company.cik}`} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ ml: 2 }}
            />
          </Box>
        </Box>
        
        <Button 
          startIcon={<ResetIcon />}
          variant="outlined"
          onClick={onReset}
          size="small"
        >
          Change Company
        </Button>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Typography variant="h6" gutterBottom>
            Financial Data
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onLoadFinancials}
            fullWidth
          >
            Load Financial Statements
          </Button>
        </Grid>
        
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Typography variant="h6" gutterBottom>
            SEC Links
          </Typography>
          <Link 
            href={`https://www.sec.gov/edgar/browse/?CIK=${company.cik}`} 
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
          >
            <LinkIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
            EDGAR Company Page
          </Link>
          <Link 
            href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}`} 
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <LinkIcon sx={{ mr: 1, fontSize: '0.9rem' }} />
            Legacy EDGAR Search
          </Link>
        </Grid>
      </Grid>
      
      {filings.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom>
            Recent Filings
          </Typography>
          
          <Box sx={{ 
            maxHeight: 200, 
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
            },
          }}>
            {filings
              .filter(filing => filing.form === '10-K' || filing.form === '10-Q')
              .slice(0, 10)
              .map((filing, index) => (
                <Paper 
                  key={index} 
                  variant="outlined" 
                  sx={{ p: 1, mb: 1, cursor: 'pointer' }}
                  onClick={() => onSelectFiling(filing)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight="bold">
                      {filing.form}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Filed: {new Date(filing.filingDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Period: {new Date(filing.reportDate).toLocaleDateString()}
                  </Typography>
                </Paper>
              ))}
          </Box>
        </>
      )}
    </Paper>
  );
}; 