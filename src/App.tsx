import { 
  Container, 
  Box, 
  Typography, 
  AppBar, 
  Toolbar, 
  Paper,
  Grid,
  CssBaseline,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import { 
  ShowChart as ChartIcon,
  RestartAlt as ResetIcon,
  Info as InfoIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Theme provider
import { ThemeProvider } from './theme/ThemeProvider';
import { DarkModeToggle } from './components/common/DarkModeToggle';

// Components
import { CompanySearch } from './components/company-search/CompanySearch';
import { CompanyInfo } from './components/company-search/CompanyInfo';
import { FinancialTabs } from './components/data-display/FinancialTabs';
import { FormSelector, FormType, FilingPeriod } from './components/data-display/FormSelector';

// Store
import { useCompanyStore } from './store/companyStore';

// Services
import { getCompanyInfo } from './services/api/companyApi';
import { getFinancialStatements, debugFinancialData } from './services/api/financialsApi';

/**
 * Main application component
 */
function App() {
  // Company store state
  const { 
    selectedCompany,
    companyFilings,
    incomeStatement,
    balanceSheet,
    cashFlowStatement,
    isLoadingCompany,
    isLoadingFinancials,
    companyError,
    financialsError,
    filingFilter,
    setSelectedCompany,
    setCompanyFilings,
    setIncomeStatement,
    setBalanceSheet,
    setCashFlowStatement,
    setIsLoadingCompany,
    setIsLoadingFinancials,
    setCompanyError,
    setFinancialsError,
    setFormType,
    setPeriod
  } = useCompanyStore();
  
  // Handle company selection
  const handleSelectCompany = async (company: typeof selectedCompany) => {
    if (!company) return;
    
    setSelectedCompany(company);
    setCompanyFilings([]);
    setIncomeStatement(null);
    setBalanceSheet(null);
    setCashFlowStatement(null);
    
    // Load company filings
    setIsLoadingCompany(true);
    setCompanyError(null);
    
    try {
      const { companyInfo, filings } = await getCompanyInfo(company.cik);
      setSelectedCompany(companyInfo);
      setCompanyFilings(filings);
      setCompanyError(null);
    } catch (error) {
      console.error('Error loading company info:', error);
      setCompanyError('Failed to load company information. Please try again.');
    } finally {
      setIsLoadingCompany(false);
    }
  };
  
  // Reset company selection
  const handleResetCompany = () => {
    setSelectedCompany(null);
    setCompanyFilings([]);
    setIncomeStatement(null);
    setBalanceSheet(null);
    setCashFlowStatement(null);
    setCompanyError(null);
    setFinancialsError(null);
  };
  
  // Load financial statements
  const handleLoadFinancials = async () => {
    if (!selectedCompany) return;
    
    setIsLoadingFinancials(true);
    setFinancialsError(null);
    
    try {
      // Get the current filing filter from store
      const { filingFilter } = useCompanyStore.getState();
      
      const { incomeStatement, balanceSheet, cashFlowStatement } = 
        await getFinancialStatements(selectedCompany.cik, filingFilter);
      
      setIncomeStatement(incomeStatement);
      setBalanceSheet(balanceSheet);
      setCashFlowStatement(cashFlowStatement);
      
      if (!incomeStatement && !balanceSheet && !cashFlowStatement) {
        setFinancialsError(`No financial data found for ${filingFilter.formType}${filingFilter.formType === '10-Q' ? ' - ' + filingFilter.period : ''}. Try a different form type.`);
      } else {
        setFinancialsError(null);
      }
    } catch (error) {
      console.error('Error loading financial statements:', error);
      setFinancialsError('Failed to load financial data. Please try again.');
    } finally {
      setIsLoadingFinancials(false);
    }
  };
  
  // Handle retry loading financials
  const handleRetryLoadFinancials = () => {
    handleLoadFinancials();
  };

  // Form selector handlers
  const handleFormTypeChange = (formType: FormType) => {
    setFormType(formType);
    // If changing away from quarterly, reset period to FY
    if (formType !== '10-Q') {
      setPeriod('FY');
    }
    if (hasLoadedFinancials) {
      handleLoadFinancials(); // Reload data with new form type
    }
  };
  
  const handlePeriodChange = (period: FilingPeriod) => {
    setPeriod(period);
    if (hasLoadedFinancials) {
      handleLoadFinancials(); // Reload data with new period
    }
  };
  
  const hasLoadedFinancials = incomeStatement || balanceSheet || cashFlowStatement;
  
  return (
    <ThemeProvider>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar 
          position="static" 
          elevation={0} 
          sx={{ 
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: 1100,
            backgroundColor: 'background.paper'
          }}
        >
          <Toolbar variant="dense" sx={{ display: 'flex', alignItems: 'center', minHeight: '46px', px: { xs: 1, sm: 2 } }}>
            <ChartIcon sx={{ mr: 1, color: 'primary.main', fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" component="div" sx={{ mr: 2, fontWeight: 600, color: 'text.primary' }}>
              SEC Filings Sankey
            </Typography>
            
            {/* Search component in the AppBar */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {selectedCompany ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`${selectedCompany.ticker} - ${selectedCompany.name}`}
                    color="primary"
                    variant="filled"
                    size="small"
                    sx={{ mr: 1, height: '28px' }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={handleResetCompany}
                    startIcon={<ResetIcon sx={{ fontSize: '1rem' }} />}
                    sx={{ fontSize: '0.75rem', height: '28px', py: 0 }}
                  >
                    Change
                  </Button>
                </Box>
              ) : (
                <Box sx={{ minWidth: '300px', maxWidth: '400px', mx: 'auto' }}>
                  <CompanySearch onSelectCompany={handleSelectCompany} compact={true} />
                </Box>
              )}
            </Box>
            
            <DarkModeToggle />
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 2, mb: 3, flexGrow: 1, px: { xs: 1, sm: 2 } }}>
          {!selectedCompany ? (
            <Paper sx={{ p: 4, textAlign: 'center', mt: 8, borderRadius: 2 }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                SEC Filings Sankey Diagram Visualization
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                Search for a company in the search bar above to view interactive Sankey diagrams of their financial statements.
              </Typography>
              <Box sx={{ maxWidth: 500, mx: 'auto', mt: 5 }}>
                <CompanySearch onSelectCompany={handleSelectCompany} />
              </Box>
            </Paper>
          ) : (
            <Box>
              {/* Combined Company Info Header and Form Selector */}
              <Paper sx={{ 
                p: { xs: 1.5, sm: 2 }, 
                mb: 2, 
                borderRadius: 2
              }}>
                <Box sx={{
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 1
                }}>
                  {/* Company Info */}
                  <Box sx={{ mb: { xs: 1, md: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ mr: 1, fontWeight: 600 }}>
                        {selectedCompany.name} ({selectedCompany.ticker})
                      </Typography>
                      <Tooltip title="View on SEC.gov">
                        <IconButton 
                          size="small" 
                          component={Link} 
                          href={`https://www.sec.gov/edgar/browse/?CIK=${selectedCompany.cik}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                          sx={{ p: 0.5 }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      CIK: {selectedCompany.cik} • Exchange: {selectedCompany.exchange || 'N/A'}
                    </Typography>
                    
                    {companyError && (
                      <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        {companyError}
                      </Typography>
                    )}
                  </Box>

                  {/* Controls */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    justifyContent: 'flex-end',
                    gap: 1
                  }}>
                    {/* Form Selector */}
                    <FormSelector
                      selectedForm={filingFilter.formType}
                      selectedPeriod={filingFilter.period}
                      onFormChange={handleFormTypeChange}
                      onPeriodChange={handlePeriodChange}
                      disabled={isLoadingFinancials}
                    />
                  
                    {/* Load/Refresh Button */}
                    {hasLoadedFinancials ? (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                      }}>
                        <Chip 
                          color="success" 
                          size="small" 
                          label="Data Loaded" 
                          sx={{ mr: 1, height: '24px', fontSize: '0.7rem' }} 
                        />
                        <Button
                          variant="outlined"
                          onClick={handleLoadFinancials}
                          disabled={isLoadingFinancials}
                          size="small"
                          sx={{ mr: 1, fontSize: '0.75rem', height: '28px', py: 0 }}
                        >
                          Refresh
                        </Button>
                        <Tooltip title="Debug financial data">
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ p: 0.5 }}
                            onClick={async () => {
                              const { filingFilter } = useCompanyStore.getState();
                              if (selectedCompany) {
                                console.log('Debugging financial data...');
                                const debugData = await debugFinancialData(selectedCompany.cik, filingFilter);
                                console.log('Debug results:', debugData);
                                alert('Debug data logged to console. Press F12 to view.');
                              }
                            }}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLoadFinancials}
                        disabled={isLoadingFinancials}
                        size="small"
                        sx={{ fontSize: '0.75rem', py: 0.5, height: '28px' }}
                      >
                        Load Data
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
              
              {/* Financial data visualization without the form selector */}
              <FinancialTabs
                incomeStatement={incomeStatement}
                balanceSheet={balanceSheet}
                cashFlowStatement={cashFlowStatement}
                isLoading={isLoadingFinancials}
                error={financialsError}
                onRetry={handleRetryLoadFinancials}
                hideFormSelector={true}
              />
            </Box>
          )}
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            py: 1, 
            px: 2, 
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="caption" color="text.secondary" align="center">
              SEC Filings Sankey Visualizer • Educational Project • {new Date().getFullYear()}
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
