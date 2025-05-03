import { FC, useState, SyntheticEvent } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper,
  Typography,
  Alert,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { 
  AccountBalance as BalanceSheetIcon,
  TrendingUp as IncomeStatementIcon,
  AccountBalanceWallet as CashFlowIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  IncomeStatement, 
  BalanceSheet, 
  CashFlowStatement,
  SankeyData
} from '../../types/financials';
import { SankeyDiagram } from '../sankey-diagrams/SankeyDiagram';
import { 
  incomeStatementToSankey, 
  balanceSheetToSankey, 
  cashFlowToSankey 
} from '../../services/transformers/sankeyTransformers';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FormSelector, FormType, FilingPeriod } from '../data-display/FormSelector';
import { FilingFilter } from '../../services/api/financialsApi';

// Import store for form type
import { useCompanyStore } from '../../store/companyStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Tab panel component for financial data
 */
const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-tabpanel-${index}`}
      aria-labelledby={`financial-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

interface FinancialTabsProps {
  incomeStatement: IncomeStatement | null;
  balanceSheet: BalanceSheet | null;
  cashFlowStatement: CashFlowStatement | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hideFormSelector?: boolean;
}

/**
 * Component displaying financial data with tabs for different statement types
 */
export const FinancialTabs: FC<FinancialTabsProps> = ({
  incomeStatement,
  balanceSheet,
  cashFlowStatement,
  isLoading,
  error,
  onRetry,
  hideFormSelector = false
}) => {
  const [tabValue, setTabValue] = useState(0);
  
  // Get filing filter from store
  const { 
    filingFilter, 
    setFormType, 
    setPeriod 
  } = useCompanyStore();
  
  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Form selector handlers
  const handleFormTypeChange = (formType: FormType) => {
    setFormType(formType);
    // If changing away from quarterly, reset period to FY
    if (formType !== '10-Q') {
      setPeriod('FY');
    }
    onRetry(); // Reload data with new form type
  };
  
  const handlePeriodChange = (period: FilingPeriod) => {
    setPeriod(period);
    onRetry(); // Reload data with new period
  };
  
  // Convert financial data to Sankey diagram format
  const incomeSankeyData: SankeyData = incomeStatement 
    ? incomeStatementToSankey(incomeStatement)
    : { nodes: [], links: [] };
    
  const balanceSheetSankeyData: SankeyData = balanceSheet
    ? balanceSheetToSankey(balanceSheet)
    : { nodes: [], links: [] };
    
  const cashFlowSankeyData: SankeyData = cashFlowStatement
    ? cashFlowToSankey(cashFlowStatement)
    : { nodes: [], links: [] };
  
  // Check if we have data for each tab
  const hasIncomeData = incomeSankeyData.nodes.length > 0;
  const hasBalanceSheetData = balanceSheetSankeyData.nodes.length > 0;
  const hasCashFlowData = cashFlowSankeyData.nodes.length > 0;
  
  // Handle loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading financial data..." />;
  }
  
  // Handle error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onRetry}
            startIcon={<RefreshIcon />}
          >
            Retry
          </Button>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }
  
  // Handle no data state
  if (!hasIncomeData && !hasBalanceSheetData && !hasCashFlowData) {
    return (
      <Box>
        {!hideFormSelector && (
          <FormSelector
            selectedForm={filingFilter.formType}
            selectedPeriod={filingFilter.period}
            onFormChange={handleFormTypeChange}
            onPeriodChange={handlePeriodChange}
            disabled={isLoading}
          />
        )}
        <Alert severity="info" sx={{ mb: 2 }}>
          No financial data available for the selected form type. Please click the "Load Financial Data" button to fetch financial statements.
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {!hideFormSelector && (
        <FormSelector
          selectedForm={filingFilter.formType}
          selectedPeriod={filingFilter.period}
          onFormChange={handleFormTypeChange}
          onPeriodChange={handlePeriodChange}
          disabled={isLoading}
        />
      )}
      
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="Financial statement tabs"
            variant="fullWidth"
            sx={{ 
              '& .MuiTab-root': { 
                py: 1,
                fontWeight: 500,
                minHeight: '48px'
              }
            }}
          >
            <Tab 
              icon={<IncomeStatementIcon sx={{ fontSize: 18 }} />} 
              label="Income" 
              disabled={!hasIncomeData}
              id="financial-tab-0"
              aria-controls="financial-tabpanel-0"
              iconPosition="start"
              sx={{ fontSize: '0.85rem' }}
            />
            <Tab 
              icon={<BalanceSheetIcon sx={{ fontSize: 18 }} />} 
              label="Balance Sheet" 
              disabled={!hasBalanceSheetData}
              id="financial-tab-1"
              aria-controls="financial-tabpanel-1"
              iconPosition="start"
              sx={{ fontSize: '0.85rem' }}
            />
            <Tab 
              icon={<CashFlowIcon sx={{ fontSize: 18 }} />} 
              label="Cash Flow" 
              disabled={!hasCashFlowData}
              id="financial-tab-2"
              aria-controls="financial-tabpanel-2"
              iconPosition="start"
              sx={{ fontSize: '0.85rem' }}
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {hasIncomeData && incomeStatement ? (
            <SankeyDiagram 
              data={incomeSankeyData} 
              title={`Income Statement (${filingFilter.formType}${filingFilter.formType === '10-Q' ? ' - ' + filingFilter.period : ''})`}
              height={550}
              period={incomeStatement.periodEnd}
              rawData={incomeStatement}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Income statement data not available for this form type
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {hasBalanceSheetData && balanceSheet ? (
            <SankeyDiagram 
              data={balanceSheetSankeyData} 
              title={`Balance Sheet (${filingFilter.formType}${filingFilter.formType === '10-Q' ? ' - ' + filingFilter.period : ''})`}
              height={550}
              period={balanceSheet.periodEnd}
              rawData={balanceSheet}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Balance sheet data not available for this form type
              </Typography>
            </Box>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {hasCashFlowData && cashFlowStatement ? (
            <SankeyDiagram 
              data={cashFlowSankeyData} 
              title={`Cash Flow Statement (${filingFilter.formType}${filingFilter.formType === '10-Q' ? ' - ' + filingFilter.period : ''})`}
              height={550}
              period={cashFlowStatement.periodEnd}
              rawData={cashFlowStatement}
            />
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Cash flow statement data not available for this form type
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
}; 