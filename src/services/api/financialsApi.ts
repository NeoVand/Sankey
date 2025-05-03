import { secApi, EDGAR_COMPANY_FACTS_URL, EDGAR_COMPANY_CONCEPT_URL } from './apiConfig';
import {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  FinancialItem
} from '../../types/financials';
import { FormType, FilingPeriod } from '../../components/data-display/FormSelector';

// Filing filter options
export interface FilingFilter {
  formType: FormType;
  period: FilingPeriod;
}

/**
 * Pad a CIK number with leading zeros to 10 digits
 */
const padCik = (cik: string): string => {
  return cik.padStart(10, '0');
};

/**
 * Get all company financial facts
 */
export const getCompanyFacts = async (cik: string) => {
  try {
    const paddedCik = padCik(cik);
    const response = await secApi.get(`${EDGAR_COMPANY_FACTS_URL}/CIK${paddedCik}.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company facts:', error);
    throw error;
  }
};

/**
 * Get financial data for a specific concept
 */
export const getCompanyConcept = async (cik: string, taxonomy: string, concept: string) => {
  try {
    const paddedCik = padCik(cik);
    const response = await secApi.get(`${EDGAR_COMPANY_CONCEPT_URL}/CIK${paddedCik}/${taxonomy}/${concept}.json`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching concept ${taxonomy}/${concept}:`, error);
    throw error;
  }
};

/**
 * Extract value from facts data based on form type and period
 */
const extractValue = (
  factsData: any, 
  taxonomy: string, 
  concept: string, 
  filter: FilingFilter = { formType: '10-K', period: 'FY' }
): { value: number | null, periodEnd: string } => {
  try {
    // Navigate through the facts data structure
    const facts = factsData.facts;
    const taxonomyData = facts[taxonomy];
    
    if (!taxonomyData) return { value: null, periodEnd: '' };
    
    const conceptData = taxonomyData[concept];
    
    if (!conceptData || !conceptData.units) return { value: null, periodEnd: '' };
    
    // Get the unit (usually USD)
    const unitKey = Object.keys(conceptData.units)[0];
    const values = conceptData.units[unitKey];
    
    if (!values || !values.length) return { value: null, periodEnd: '' };
    
    // Apply filters based on form type and period
    let filteredValues = values;
    
    // For debugging
    console.log(`Extracting ${concept}, form: ${filter.formType}, period: ${filter.period}`);
    console.log(`Available values:`, values.map((item: any) => ({
      form: item.form,
      fp: item.fp,
      end: item.end,
      val: item.val
    })));
    
    // Filter by form type
    if (filter.formType !== 'ALL') {
      filteredValues = filteredValues.filter((item: any) => 
        item.form === filter.formType
      );
    }
    
    // Filter by period for quarterly reports
    if (filter.formType === '10-Q') {
      if (filter.period !== 'ALL') {
        filteredValues = filteredValues.filter((item: any) => 
          item.fp === filter.period // Exact match on quarterly period
        );
      }
    } else if (filter.formType === '10-K') {
      // For 10-K, we want fiscal year data
      filteredValues = filteredValues.filter((item: any) => 
        item.fp === 'FY'
      );
    }
    
    // Filter out segment data which can cause duplication
    filteredValues = filteredValues.filter((item: any) => !item.segment);
    
    // If we have no filtered values, try to be more lenient with quarterly filtering
    if (!filteredValues.length && filter.formType === '10-Q') {
      // Try again without the period filter
      filteredValues = values.filter((item: any) => 
        item.form === '10-Q' && !item.segment
      );
      
      // Log this fallback
      if (filteredValues.length) {
        console.log(`Found values for ${concept} after relaxing period filter:`, 
          filteredValues.map((item: any) => ({
            form: item.form,
            fp: item.fp,
            end: item.end,
            val: item.val
          }))
        );
      }
    }
    
    if (!filteredValues.length) return { value: null, periodEnd: '' };
    
    // Sort by end date to get most recent
    filteredValues.sort((a: any, b: any) => 
      new Date(b.end).getTime() - new Date(a.end).getTime()
    );
    
    console.log(`Using value for ${concept}:`, {
      form: filteredValues[0].form,
      fp: filteredValues[0].fp,
      end: filteredValues[0].end,
      val: filteredValues[0].val
    });
    
    return { 
      value: filteredValues[0].val,
      periodEnd: filteredValues[0].end
    };
  } catch (error) {
    console.error(`Error extracting ${taxonomy}/${concept}:`, error);
    return { value: null, periodEnd: '' };
  }
};

/**
 * Create a financial item from facts data
 */
const createFinancialItem = (
  factsData: any, 
  taxonomy: string, 
  concept: string, 
  label: string,
  filter: FilingFilter
): FinancialItem | null => {
  const { value, periodEnd } = extractValue(factsData, taxonomy, concept, filter);
  
  if (value === null) return null;
  
  // Find the unit from the facts data
  let unit = 'USD';
  try {
    const facts = factsData.facts;
    const taxonomyData = facts[taxonomy];
    const conceptData = taxonomyData[concept];
    const unitKey = Object.keys(conceptData.units)[0];
    unit = unitKey;
  } catch (error) {
    // Default to USD if unit extraction fails
    unit = 'USD';
  }
  
  return {
    label,
    value: Math.abs(value), // Ensure positive for visualization
    unit,
    periodEnd
  };
};

/**
 * Try multiple alternative concept names for the same financial item
 */
const tryAlternativeConcepts = (
  factsData: any, 
  concepts: string[], 
  label: string,
  filter: FilingFilter
): FinancialItem | null => {
  // Try each concept in order
  for (const concept of concepts) {
    const item = createFinancialItem(factsData, 'us-gaap', concept, label, filter);
    if (item) {
      console.log(`Found value for ${label} using concept: ${concept}`);
      return item;
    }
  }
  
  console.log(`No value found for ${label} after trying ${concepts.length} concepts`);
  return null;
};

/**
 * Log which concepts were found in the data for debugging
 */
const logAvailableConcepts = (factsData: any, prefix: string = '') => {
  try {
    const taxonomyData = factsData.facts['us-gaap'];
    if (!taxonomyData) return;
    
    const concepts = Object.keys(taxonomyData).sort();
    console.log(`${prefix} Available concepts (${concepts.length}):`);
    
    // Just log a few concepts for reference
    const relevantPatterns = [
      'Revenue', 'Income', 'Expense', 'Asset', 'Liability', 'Equity', 
      'Cash', 'Debt', 'Tax', 'Net', 'Profit', 'Loss', 'Stock', 'Share',
      'Capital', 'Operating', 'Investment', 'Financing'
    ];
    
    // Filter concepts by patterns
    const filteredConcepts = concepts.filter(concept => 
      relevantPatterns.some(pattern => concept.includes(pattern))
    );
    
    console.log(`${prefix} Found ${filteredConcepts.length} relevant concepts`);
    console.log(filteredConcepts.slice(0, 30).join(', '));
    
  } catch (error) {
    console.error('Error logging available concepts:', error);
  }
};

/**
 * Get all financial statements for a company
 */
export const getFinancialStatements = async (
  cik: string,
  filter: FilingFilter = { formType: '10-K', period: 'FY' }
): Promise<{
  incomeStatement: IncomeStatement | null;
  balanceSheet: BalanceSheet | null;
  cashFlowStatement: CashFlowStatement | null;
}> => {
  try {
    // Get all company facts
    const factsData = await getCompanyFacts(cik);
    
    // Log available concepts for debugging
    logAvailableConcepts(factsData, 'SEC Data:');
    
    // Extract Income Statement items with multiple alternatives
    const revenue = tryAlternativeConcepts(factsData, [
      'Revenues', 
      'RevenueFromContractWithCustomerExcludingAssessedTax', 
      'SalesRevenueNet', 
      'SalesRevenueGoodsNet',
      'RevenueFromContractWithCustomer',
      'RegulatedAndUnregulatedOperatingRevenue'
    ], 'Revenue', filter);
    
    const costOfRevenue = tryAlternativeConcepts(factsData, [
      'CostOfRevenue', 
      'CostOfGoodsAndServicesSold', 
      'CostOfGoodsSold',
      'CostOfServices',
      'CostOfGoodsSoldExcludingDepreciationDepletionAndAmortization'
    ], 'Cost of Revenue', filter);
    
    const grossProfit = tryAlternativeConcepts(factsData, [
      'GrossProfit',
      'GrossMargin'
    ], 'Gross Profit', filter);
    
    const operatingExpenses = tryAlternativeConcepts(factsData, [
      'OperatingExpenses', 
      'SellingGeneralAndAdministrativeExpense',
      'GeneralAndAdministrativeExpense',
      'SellingAndMarketingExpense',
      'ResearchAndDevelopmentExpense'
    ], 'Operating Expenses', filter);
    
    const operatingIncome = tryAlternativeConcepts(factsData, [
      'OperatingIncomeLoss',
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest',
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxes'
    ], 'Operating Income', filter);
    
    const netIncome = tryAlternativeConcepts(factsData, [
      'NetIncomeLoss', 
      'ProfitLoss', 
      'NetIncomeLossAvailableToCommonStockholdersBasic',
      'NetIncomeLossAttributableToParent',
      'IncomeLossFromContinuingOperations'
    ], 'Net Income', filter);
    
    // Extract Balance Sheet items with multiple alternatives
    const totalAssets = tryAlternativeConcepts(factsData, [
      'Assets',
      'AssetsTotal',
      'AssetsCurrent'
    ], 'Total Assets', filter);
    
    const cashAndEquivalents = tryAlternativeConcepts(factsData, [
      'CashAndCashEquivalentsAtCarryingValue', 
      'Cash',
      'CashAndDueFromBanks',
      'CashCashEquivalentsAndShortTermInvestments'
    ], 'Cash & Equivalents', filter);
    
    const shortTermInvestments = tryAlternativeConcepts(factsData, [
      'MarketableSecurities', 
      'ShortTermInvestments',
      'AvailableForSaleSecurities',
      'TradingSecurities'
    ], 'Short-term Investments', filter);
    
    const accountsReceivable = tryAlternativeConcepts(factsData, [
      'AccountsReceivableNetCurrent', 
      'AccountsNotesAndLoansReceivableNetCurrent',
      'ReceivablesNetCurrent',
      'AccountsReceivableNet'
    ], 'Accounts Receivable', filter);
    
    const inventory = tryAlternativeConcepts(factsData, [
      'InventoryNet', 
      'InventoryFinishedGoodsNetOfReserves',
      'InventoryGross',
      'InventoryWork'
    ], 'Inventory', filter);
    
    const propertyPlantEquipment = tryAlternativeConcepts(factsData, [
      'PropertyPlantAndEquipmentNet',
      'LandAndBuildingsNet',
      'PropertyPlantAndEquipmentNetIncludingFinanceLeaseRightOfUseAsset'
    ], 'PP&E', filter);
    
    const goodwill = tryAlternativeConcepts(factsData, [
      'Goodwill',
      'GoodwillAndIntangibleAssetsNet'
    ], 'Goodwill', filter);
    
    const intangibleAssets = tryAlternativeConcepts(factsData, [
      'IntangibleAssetsNetExcludingGoodwill',
      'OtherIntangibleAssetsNet'
    ], 'Intangible Assets', filter);
    
    const totalLiabilities = tryAlternativeConcepts(factsData, [
      'Liabilities',
      'LiabilitiesTotal',
      'LiabilitiesCurrent'
    ], 'Total Liabilities', filter);
    
    const accountsPayable = tryAlternativeConcepts(factsData, [
      'AccountsPayableCurrent', 
      'AccountsPayableAndAccruedLiabilitiesCurrent',
      'AccountsPayableTradeCurrent'
    ], 'Accounts Payable', filter);
    
    const shortTermDebt = tryAlternativeConcepts(factsData, [
      'LongTermDebtCurrent', 
      'ShortTermBorrowings',
      'LongTermDebtAndCapitalLeaseObligationsCurrent',
      'CommercialPaper'
    ], 'Short-term Debt', filter);
    
    const longTermDebt = tryAlternativeConcepts(factsData, [
      'LongTermDebtNoncurrent', 
      'LongTermDebt',
      'LongTermDebtAndCapitalLeaseObligations'
    ], 'Long-term Debt', filter);
    
    const totalEquity = tryAlternativeConcepts(factsData, [
      'StockholdersEquity', 
      'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
      'PartnersCapital',
      'CommonStockEquity',
      'StockholdersEquityParent'
    ], 'Total Equity', filter);
    
    // Extract Cash Flow Statement items with multiple alternatives
    const netCashFromOperations = tryAlternativeConcepts(factsData, [
      'NetCashProvidedByUsedInOperatingActivities',
      'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'
    ], 'Operating Activities', filter);
    
    const netCashFromInvesting = tryAlternativeConcepts(factsData, [
      'NetCashProvidedByUsedInInvestingActivities',
      'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'
    ], 'Investing Activities', filter);
    
    const netCashFromFinancing = tryAlternativeConcepts(factsData, [
      'NetCashProvidedByUsedInFinancingActivities',
      'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'
    ], 'Financing Activities', filter);
    
    const netChangeInCash = tryAlternativeConcepts(factsData, [
      'CashAndCashEquivalentsPeriodIncreaseDecrease',
      'NetIncreaseDecreaseInCashAndCashEquivalents',
      'CashPeriodIncreaseDecrease'
    ], 'Net Change in Cash', filter);
    
    const capitalExpenditures = tryAlternativeConcepts(factsData, [
      'PaymentsToAcquirePropertyPlantAndEquipment', 
      'PaymentsToAcquireProductiveAssets',
      'CapitalExpendituresIncurredButNotYetPaid'
    ], 'Capital Expenditures', filter);
    
    const dividendsPaid = tryAlternativeConcepts(factsData, [
      'PaymentsOfDividends', 
      'PaymentsOfOrdinaryDividends',
      'DividendsPaid',
      'CommonStockDividendsPaid'
    ], 'Dividends Paid', filter);
    
    const stockRepurchase = tryAlternativeConcepts(factsData, [
      'PaymentsForRepurchaseOfCommonStock', 
      'StockRepurchasedAndRetiredDuringPeriodValue',
      'PaymentsForRepurchaseOfEquity'
    ], 'Stock Repurchase', filter);
    
    // Calculate starting cash based on ending cash and net change
    // For cash flow visualization, we need to derive this
    const endingCash = cashAndEquivalents;
    let startingCashValue: FinancialItem | null = null;
    
    if (endingCash && netChangeInCash) {
      const startValue = endingCash.value - netChangeInCash.value;
      startingCashValue = {
        label: 'Starting Cash',
        value: Math.max(0, startValue), // Ensure non-negative
        unit: endingCash.unit,
        periodEnd: endingCash.periodEnd
      };
    }
    
    // Create Income Statement if we have at least revenue and net income
    let incomeStatement: IncomeStatement | null = null;
    if (revenue && netIncome) {
      const periodEnd = revenue.periodEnd || '';
      incomeStatement = {
        revenue: revenue,
        costOfRevenue: costOfRevenue || undefined,
        grossProfit: grossProfit || undefined,
        operatingExpenses: operatingExpenses || undefined,
        operatingIncome: operatingIncome || undefined,
        netIncome: netIncome,
        periodEnd
      };
    }
    
    // Create Balance Sheet if we have at least total assets, liabilities, and equity
    let balanceSheet: BalanceSheet | null = null;
    if (totalAssets && totalLiabilities && totalEquity) {
      const periodEnd = totalAssets.periodEnd || '';
      balanceSheet = {
        totalAssets,
        cashAndEquivalents: cashAndEquivalents || undefined,
        shortTermInvestments: shortTermInvestments || undefined,
        accountsReceivable: accountsReceivable || undefined,
        inventory: inventory || undefined,
        propertyPlantEquipment: propertyPlantEquipment || undefined,
        goodwill: goodwill || undefined,
        intangibleAssets: intangibleAssets || undefined,
        totalLiabilities,
        accountsPayable: accountsPayable || undefined,
        shortTermDebt: shortTermDebt || undefined,
        longTermDebt: longTermDebt || undefined,
        totalEquity,
        periodEnd
      };
    }
    
    // Create Cash Flow Statement if we have at least the main categories
    let cashFlowStatement: CashFlowStatement | null = null;
    
    // For quarterly reports, be more lenient - even just one cash flow measure is useful
    const hasMinimumCashFlow = 
      (filter.formType === '10-K' && netCashFromOperations && netCashFromInvesting && netCashFromFinancing) ||
      (filter.formType === '10-Q' && (netCashFromOperations || netCashFromInvesting || netCashFromFinancing));
    
    if (hasMinimumCashFlow) {
      // Use any available period end date
      const periodEnd = 
        (netCashFromOperations?.periodEnd || 
         netCashFromInvesting?.periodEnd || 
         netCashFromFinancing?.periodEnd || '');
      
      // Create placeholder values if needed
      const operationsValue = netCashFromOperations || {
        label: 'Operating Activities',
        value: 0,
        unit: 'USD',
        periodEnd
      };
      
      const investingValue = netCashFromInvesting || {
        label: 'Investing Activities',
        value: 0,
        unit: 'USD',
        periodEnd
      };
      
      const financingValue = netCashFromFinancing || {
        label: 'Financing Activities',
        value: 0,
        unit: 'USD',
        periodEnd
      };
      
      // Calculate total change if not available
      const changeInCashValue = netChangeInCash || {
        label: 'Net Change in Cash',
        value: operationsValue.value + investingValue.value + financingValue.value,
        unit: 'USD',
        periodEnd
      };
      
      // Use starting cash or create a placeholder
      const startingCash = startingCashValue || {
        label: 'Starting Cash',
        value: cashAndEquivalents ? Math.max(0, cashAndEquivalents.value - changeInCashValue.value) : 100000, // Arbitrary value
        unit: 'USD',
        periodEnd
      };
      
      // Use ending cash or calculate it
      const endingCashValue = endingCash || {
        label: 'Ending Cash',
        value: startingCash.value + changeInCashValue.value,
        unit: 'USD',
        periodEnd
      };
      
      cashFlowStatement = {
        startingCash: startingCash,
        netCashFromOperations: operationsValue,
        netCashFromInvesting: investingValue,
        netCashFromFinancing: financingValue,
        netChangeInCash: changeInCashValue,
        endingCash: endingCashValue,
        capitalExpenditures: capitalExpenditures || undefined,
        dividendsPaid: dividendsPaid || undefined,
        stockRepurchase: stockRepurchase || undefined,
        periodEnd
      };
    }
    
    return {
      incomeStatement,
      balanceSheet,
      cashFlowStatement
    };
  } catch (error) {
    console.error('Error getting financial statements:', error);
    throw error;
  }
};

/**
 * Helper function to debug data issues
 */
export const debugFinancialData = (
  cik: string,
  filter: FilingFilter = { formType: '10-K', period: 'FY' }
): Promise<any> => {
  return new Promise(async (resolve) => {
    try {
      // Get full raw data
      const factsData = await getCompanyFacts(cik);
      
      // Log all XBRL concepts used by this company
      logAvailableConcepts(factsData, 'All available concepts:');
      
      // Try to detect the most important XBRL concepts
      const conceptCategories = {
        revenue: [
          'Revenues', 
          'RevenueFromContractWithCustomerExcludingAssessedTax', 
          'SalesRevenueNet', 
          'SalesRevenueGoodsNet',
          'RevenueFromContractWithCustomer',
          'RegulatedAndUnregulatedOperatingRevenue'
        ],
        assets: [
          'Assets',
          'AssetsTotal',
          'AssetsCurrent'
        ],
        liabilities: [
          'Liabilities',
          'LiabilitiesTotal',
          'LiabilitiesCurrent'
        ],
        equity: [
          'StockholdersEquity', 
          'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest',
          'PartnersCapital',
          'CommonStockEquity',
          'StockholdersEquityParent'
        ],
        cashFlow: [
          'NetCashProvidedByUsedInOperatingActivities',
          'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations',
          'NetCashProvidedByUsedInInvestingActivities',
          'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations',
          'NetCashProvidedByUsedInFinancingActivities',
          'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'
        ]
      };
      
      // Check for each concept if it exists in the company data and extract values
      const conceptValues: Record<string, any> = {};
      
      Object.entries(conceptCategories).forEach(([category, concepts]) => {
        conceptValues[category] = {};
        
        concepts.forEach(concept => {
          const result = extractValue(factsData, 'us-gaap', concept, filter);
          if (result.value !== null) {
            conceptValues[category][concept] = result;
          }
        });
      });
      
      resolve({
        availableConcepts: Object.keys(factsData.facts['us-gaap'] || {}),
        conceptValues,
        filter,
        rawData: factsData
      });
    } catch (error) {
      console.error('Error in debugFinancialData:', error);
      resolve({ error });
    }
  });
}; 