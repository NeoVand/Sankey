import {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  SankeyData,
  SankeyNode,
  SankeyLink
} from '../../types/financials';

/**
 * Transform income statement data to Sankey diagram format
 */
export const incomeStatementToSankey = (incomeStatement: IncomeStatement): SankeyData => {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  
  // Get all values, ensuring they're not undefined
  const revenueValue = incomeStatement.revenue.value;
  const costOfRevenueValue = incomeStatement.costOfRevenue?.value || 0;
  const grossProfitValue = incomeStatement.grossProfit?.value || 0;
  const operatingExpensesValue = incomeStatement.operatingExpenses?.value || 0;
  const operatingIncomeValue = incomeStatement.operatingIncome?.value || 0;
  const netIncomeValue = incomeStatement.netIncome.value;
  
  // Calculate minimum flow value to ensure connections (for visualization)
  const minFlowValue = Math.max(1, revenueValue * 0.01);
  
  // Create main nodes with values
  nodes.push({ id: 'revenue', name: 'Revenue', value: revenueValue });
  
  if (incomeStatement.costOfRevenue) {
    nodes.push({ id: 'costOfRevenue', name: 'Cost of Revenue', value: costOfRevenueValue });
  }
  
  if (incomeStatement.grossProfit) {
    nodes.push({ id: 'grossProfit', name: 'Gross Profit', value: grossProfitValue });
  }
  
  if (incomeStatement.operatingExpenses) {
    nodes.push({ id: 'operatingExpenses', name: 'Operating Expenses', value: operatingExpensesValue });
  }
  
  if (incomeStatement.operatingIncome) {
    nodes.push({ id: 'operatingIncome', name: 'Operating Income', value: operatingIncomeValue });
  }
  
  nodes.push({ id: 'netIncome', name: 'Net Income', value: netIncomeValue });
  
  // Cost of revenue path
  if (incomeStatement.costOfRevenue && incomeStatement.grossProfit) {
    links.push({
      source: 'revenue',
      target: 'costOfRevenue',
      value: Math.max(minFlowValue, costOfRevenueValue),
    });
    
    links.push({
      source: 'revenue',
      target: 'grossProfit',
      value: Math.max(minFlowValue, grossProfitValue),
    });
  }
  
  // Gross profit to operating expenses path
  if (incomeStatement.grossProfit && incomeStatement.operatingExpenses && incomeStatement.operatingIncome) {
    links.push({
      source: 'grossProfit',
      target: 'operatingExpenses',
      value: Math.max(minFlowValue, operatingExpensesValue),
    });
    
    links.push({
      source: 'grossProfit',
      target: 'operatingIncome',
      value: Math.max(minFlowValue, operatingIncomeValue),
    });
  } else if (incomeStatement.grossProfit && incomeStatement.netIncome) {
    // Direct path to net income if no operating figures
    links.push({
      source: 'grossProfit',
      target: 'netIncome',
      value: Math.max(minFlowValue, netIncomeValue),
    });
  }
  
  // Operating income to net income
  if (incomeStatement.operatingIncome) {
    links.push({
      source: 'operatingIncome',
      target: 'netIncome',
      value: Math.max(minFlowValue, netIncomeValue),
    });
  }
  
  // If we don't have detailed breakdowns, create direct links
  if (!incomeStatement.costOfRevenue || !incomeStatement.grossProfit) {
    if (incomeStatement.operatingExpenses) {
      links.push({
        source: 'revenue',
        target: 'operatingExpenses',
        value: Math.max(minFlowValue, operatingExpensesValue),
      });
    }
    
    if (incomeStatement.operatingIncome) {
      links.push({
        source: 'revenue',
        target: 'operatingIncome',
        value: Math.max(minFlowValue, operatingIncomeValue),
      });
    } else {
      links.push({
        source: 'revenue',
        target: 'netIncome',
        value: Math.max(minFlowValue, netIncomeValue),
      });
    }
  }
  
  return { nodes, links };
};

/**
 * Transform balance sheet data to Sankey diagram format
 */
export const balanceSheetToSankey = (balanceSheet: BalanceSheet): SankeyData => {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  
  // Get main balances, ensuring they're not undefined
  const totalAssetsValue = balanceSheet.totalAssets.value;
  const totalLiabilitiesValue = balanceSheet.totalLiabilities.value;
  const totalEquityValue = balanceSheet.totalEquity.value;
  
  // Calculate minimum flow value to ensure connections (for visualization)
  const minFlowValue = Math.max(1, totalAssetsValue * 0.01);
  
  // Assets nodes
  const assetNodes = [
    { id: 'totalAssets', name: 'Total Assets', item: balanceSheet.totalAssets, value: totalAssetsValue },
  ];
  
  if (balanceSheet.cashAndEquivalents) {
    assetNodes.push({ 
      id: 'cashAndEquivalents', 
      name: 'Cash & Equivalents', 
      item: balanceSheet.cashAndEquivalents,
      value: balanceSheet.cashAndEquivalents.value 
    });
  }
  
  if (balanceSheet.shortTermInvestments) {
    assetNodes.push({ 
      id: 'shortTermInvestments', 
      name: 'Short-term Investments', 
      item: balanceSheet.shortTermInvestments,
      value: balanceSheet.shortTermInvestments.value
    });
  }
  
  if (balanceSheet.accountsReceivable) {
    assetNodes.push({ 
      id: 'accountsReceivable', 
      name: 'Accounts Receivable', 
      item: balanceSheet.accountsReceivable,
      value: balanceSheet.accountsReceivable.value
    });
  }
  
  if (balanceSheet.inventory) {
    assetNodes.push({ 
      id: 'inventory', 
      name: 'Inventory', 
      item: balanceSheet.inventory,
      value: balanceSheet.inventory.value
    });
  }
  
  if (balanceSheet.propertyPlantEquipment) {
    assetNodes.push({ 
      id: 'propertyPlantEquipment', 
      name: 'PP&E', 
      item: balanceSheet.propertyPlantEquipment,
      value: balanceSheet.propertyPlantEquipment.value
    });
  }
  
  if (balanceSheet.goodwill) {
    assetNodes.push({ 
      id: 'goodwill', 
      name: 'Goodwill', 
      item: balanceSheet.goodwill,
      value: balanceSheet.goodwill.value
    });
  }
  
  if (balanceSheet.intangibleAssets) {
    assetNodes.push({ 
      id: 'intangibleAssets', 
      name: 'Intangible Assets', 
      item: balanceSheet.intangibleAssets,
      value: balanceSheet.intangibleAssets.value
    });
  }
  
  if (balanceSheet.otherAssets) {
    assetNodes.push({ 
      id: 'otherAssets', 
      name: 'Other Assets', 
      item: balanceSheet.otherAssets,
      value: balanceSheet.otherAssets.value
    });
  }
  
  // Add asset nodes
  assetNodes.forEach(node => {
    if (node.item) {
      nodes.push({ id: node.id, name: node.name, value: node.value });
    }
  });
  
  // Liabilities and equity nodes
  nodes.push({ id: 'totalLiabilities', name: 'Total Liabilities', value: totalLiabilitiesValue });
  nodes.push({ id: 'totalEquity', name: 'Total Equity', value: totalEquityValue });
  
  // Detailed liability nodes
  if (balanceSheet.accountsPayable) {
    nodes.push({ 
      id: 'accountsPayable', 
      name: 'Accounts Payable',
      value: balanceSheet.accountsPayable.value
    });
  }
  
  if (balanceSheet.shortTermDebt) {
    nodes.push({ 
      id: 'shortTermDebt', 
      name: 'Short-term Debt',
      value: balanceSheet.shortTermDebt.value
    });
  }
  
  if (balanceSheet.longTermDebt) {
    nodes.push({ 
      id: 'longTermDebt', 
      name: 'Long-term Debt',
      value: balanceSheet.longTermDebt.value 
    });
  }
  
  if (balanceSheet.otherLiabilities) {
    nodes.push({ 
      id: 'otherLiabilities', 
      name: 'Other Liabilities',
      value: balanceSheet.otherLiabilities.value
    });
  }
  
  // Asset links
  assetNodes.slice(1).forEach(node => {
    if (node.item) {
      links.push({
        source: node.id,
        target: 'totalAssets',
        value: Math.max(minFlowValue, node.item.value),
      });
    }
  });
  
  // Sum of detailed assets vs total assets
  const detailedAssetsSum = assetNodes.slice(1).reduce((sum, node) => sum + (node.item?.value || 0), 0);
  
  // Add "Other Assets" if needed
  if (detailedAssetsSum < balanceSheet.totalAssets.value) {
    const otherAssetsValue = balanceSheet.totalAssets.value - detailedAssetsSum;
    
    if (!balanceSheet.otherAssets && otherAssetsValue > 0) {
      nodes.push({ id: 'otherAssetsCalculated', name: 'Other Assets', value: otherAssetsValue });
      links.push({
        source: 'otherAssetsCalculated',
        target: 'totalAssets',
        value: Math.max(minFlowValue, otherAssetsValue),
      });
    }
  }
  
  // Balance sheet equation: Assets = Liabilities + Equity
  links.push({
    source: 'totalAssets',
    target: 'totalLiabilities',
    value: Math.max(minFlowValue, totalLiabilitiesValue),
  });
  
  links.push({
    source: 'totalAssets',
    target: 'totalEquity',
    value: Math.max(minFlowValue, totalEquityValue),
  });
  
  // Detailed liability links
  if (balanceSheet.accountsPayable) {
    links.push({
      source: 'totalLiabilities',
      target: 'accountsPayable',
      value: Math.max(minFlowValue, balanceSheet.accountsPayable.value),
    });
  }
  
  if (balanceSheet.shortTermDebt) {
    links.push({
      source: 'totalLiabilities',
      target: 'shortTermDebt',
      value: Math.max(minFlowValue, balanceSheet.shortTermDebt.value),
    });
  }
  
  if (balanceSheet.longTermDebt) {
    links.push({
      source: 'totalLiabilities',
      target: 'longTermDebt',
      value: Math.max(minFlowValue, balanceSheet.longTermDebt.value),
    });
  }
  
  if (balanceSheet.otherLiabilities) {
    links.push({
      source: 'totalLiabilities',
      target: 'otherLiabilities',
      value: Math.max(minFlowValue, balanceSheet.otherLiabilities.value),
    });
  }
  
  return { nodes, links };
};

/**
 * Transform cash flow statement data to Sankey diagram format
 */
export const cashFlowToSankey = (cashFlow: CashFlowStatement): SankeyData => {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];
  
  // Add main nodes - the essential cash flow sequence
  nodes.push({ id: 'startingCash', name: 'Starting Cash', value: cashFlow.startingCash?.value || 1 });
  nodes.push({ id: 'operations', name: 'Operations', value: cashFlow.netCashFromOperations.value });
  nodes.push({ id: 'investing', name: 'Investing', value: cashFlow.netCashFromInvesting.value });
  nodes.push({ id: 'financing', name: 'Financing', value: cashFlow.netCashFromFinancing.value });
  nodes.push({ id: 'endingCash', name: 'Ending Cash', value: cashFlow.endingCash?.value || 1 });
  
  // Add detail nodes if available
  if (cashFlow.capitalExpenditures) {
    nodes.push({ id: 'capex', name: 'Capital Expenditures', value: cashFlow.capitalExpenditures.value });
  }
  
  if (cashFlow.dividendsPaid) {
    nodes.push({ id: 'dividends', name: 'Dividends Paid', value: cashFlow.dividendsPaid.value });
  }
  
  if (cashFlow.stockRepurchase) {
    nodes.push({ id: 'stockRepurchase', name: 'Stock Repurchase', value: cashFlow.stockRepurchase.value });
  }
  
  // Get values for calculations, ensuring non-zero
  const startingCashValue = cashFlow.startingCash?.value || 1;
  const operationsValue = cashFlow.netCashFromOperations.value;
  const investingValue = cashFlow.netCashFromInvesting.value;
  const financingValue = cashFlow.netCashFromFinancing.value;
  // Safely access netChangeInCash which is optional
  const netChangeValue = cashFlow.netChangeInCash?.value !== undefined 
    ? cashFlow.netChangeInCash.value 
    : (operationsValue + investingValue + financingValue);
  const endingCashValue = cashFlow.endingCash?.value || (startingCashValue + netChangeValue);
  
  // Calculate minimum flow value to ensure connections (for visualization)
  const minFlowValue = Math.max(1, startingCashValue * 0.1);
  
  // Main cash flow links - create a visual flow through the cash flow statement
  // Starting cash to operations
  links.push({
    source: 'startingCash',
    target: 'operations',
    value: Math.max(minFlowValue, startingCashValue)
  });
  
  // Operations to investing
  links.push({
    source: 'operations',
    target: 'investing',
    value: Math.max(minFlowValue, Math.abs(operationsValue) + startingCashValue)
  });
  
  // Investing to financing
  links.push({
    source: 'investing',
    target: 'financing',
    value: Math.max(minFlowValue, startingCashValue + Math.abs(operationsValue) + Math.abs(investingValue))
  });
  
  // Financing to ending cash
  links.push({
    source: 'financing',
    target: 'endingCash',
    value: Math.max(minFlowValue, endingCashValue)
  });
  
  // Detail links for breakdowns
  if (cashFlow.capitalExpenditures) {
    links.push({
      source: 'investing',
      target: 'capex',
      value: Math.max(minFlowValue, cashFlow.capitalExpenditures.value)
    });
  }
  
  if (cashFlow.dividendsPaid) {
    links.push({
      source: 'financing',
      target: 'dividends',
      value: Math.max(minFlowValue, cashFlow.dividendsPaid.value)
    });
  }
  
  if (cashFlow.stockRepurchase) {
    links.push({
      source: 'financing',
      target: 'stockRepurchase',
      value: Math.max(minFlowValue, cashFlow.stockRepurchase.value)
    });
  }
  
  return { nodes, links };
}; 