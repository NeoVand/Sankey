import { useQuery } from '@tanstack/react-query';
import { getFinancialStatements } from '../services/api/financialsApi';
import { IncomeStatement, BalanceSheet, CashFlowStatement } from '../types/financials';

interface FinancialDataResult {
  incomeStatement: IncomeStatement | null;
  balanceSheet: BalanceSheet | null;
  cashFlowStatement: CashFlowStatement | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for fetching financial data for a company
 */
export const useFinancialData = (cik: string | null): FinancialDataResult => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['financials', cik],
    queryFn: () => cik ? getFinancialStatements(cik) : Promise.resolve({
      incomeStatement: null,
      balanceSheet: null,
      cashFlowStatement: null
    }),
    enabled: !!cik,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1
  });
  
  return {
    incomeStatement: data?.incomeStatement || null,
    balanceSheet: data?.balanceSheet || null,
    cashFlowStatement: data?.cashFlowStatement || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch
  };
}; 