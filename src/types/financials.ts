// Generic financial item
export interface FinancialItem {
  label: string;
  value: number;
  unit?: string;
  periodEnd?: string;
}

// Sankey diagram specific types
export interface SankeyNode {
  id: string;
  name: string;
  color?: string;
  value?: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// Financial statement types
export interface IncomeStatement {
  revenue: FinancialItem;
  costOfRevenue?: FinancialItem;
  grossProfit?: FinancialItem;
  operatingExpenses?: FinancialItem;
  operatingIncome?: FinancialItem;
  netIncome: FinancialItem;
  periodEnd: string;
  [key: string]: FinancialItem | string | undefined;
}

export interface BalanceSheet {
  totalAssets: FinancialItem;
  totalLiabilities: FinancialItem;
  totalEquity: FinancialItem;
  cashAndEquivalents?: FinancialItem;
  shortTermInvestments?: FinancialItem;
  accountsReceivable?: FinancialItem;
  inventory?: FinancialItem;
  propertyPlantEquipment?: FinancialItem;
  goodwill?: FinancialItem;
  intangibleAssets?: FinancialItem;
  otherAssets?: FinancialItem;
  accountsPayable?: FinancialItem;
  shortTermDebt?: FinancialItem;
  longTermDebt?: FinancialItem;
  otherLiabilities?: FinancialItem;
  periodEnd: string;
  [key: string]: FinancialItem | string | undefined;
}

export interface CashFlowStatement {
  startingCash?: FinancialItem;
  netCashFromOperations: FinancialItem;
  netCashFromInvesting: FinancialItem;
  netCashFromFinancing: FinancialItem;
  netChangeInCash?: FinancialItem;
  endingCash?: FinancialItem;
  capitalExpenditures?: FinancialItem;
  dividendsPaid?: FinancialItem;
  stockRepurchase?: FinancialItem;
  periodEnd: string;
  [key: string]: FinancialItem | string | undefined;
} 