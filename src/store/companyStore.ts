import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CompanyInfo, 
  CompanyFilingInfo 
} from '../types/company';
import {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement
} from '../types/financials';
import { FilingFilter } from '../services/api/financialsApi';
import { FormType, FilingPeriod } from '../components/data-display/FormSelector';


interface CompanyState {
  // Selected company info
  selectedCompany: CompanyInfo | null;
  companyFilings: CompanyFilingInfo[];
  
  // Financial statements
  incomeStatement: IncomeStatement | null;
  balanceSheet: BalanceSheet | null;
  cashFlowStatement: CashFlowStatement | null;
  
  // Form filtering
  filingFilter: FilingFilter;
  
  // Loading states
  isLoadingCompany: boolean;
  isLoadingFinancials: boolean;
  
  // Error states
  companyError: string | null;
  financialsError: string | null;
  
  // Actions
  setSelectedCompany: (company: CompanyInfo | null) => void;
  setCompanyFilings: (filings: CompanyFilingInfo[]) => void;
  setIncomeStatement: (data: IncomeStatement | null) => void;
  setBalanceSheet: (data: BalanceSheet | null) => void;
  setCashFlowStatement: (data: CashFlowStatement | null) => void;
  setFilingFilter: (filter: Partial<FilingFilter>) => void;
  setFormType: (formType: FormType) => void;
  setPeriod: (period: FilingPeriod) => void;
  setIsLoadingCompany: (isLoading: boolean) => void;
  setIsLoadingFinancials: (isLoading: boolean) => void;
  setCompanyError: (error: string | null) => void;
  setFinancialsError: (error: string | null) => void;
  resetCompanyData: () => void;
  resetFinancialData: () => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      // Initial state
      selectedCompany: null,
      companyFilings: [],
      incomeStatement: null,
      balanceSheet: null,
      cashFlowStatement: null,
      filingFilter: { formType: '10-K', period: 'FY' },
      isLoadingCompany: false,
      isLoadingFinancials: false,
      companyError: null,
      financialsError: null,
      
      // Actions
      setSelectedCompany: (company) => set({ selectedCompany: company }),
      setCompanyFilings: (filings) => set({ companyFilings: filings }),
      setIncomeStatement: (data) => set({ incomeStatement: data }),
      setBalanceSheet: (data) => set({ balanceSheet: data }),
      setCashFlowStatement: (data) => set({ cashFlowStatement: data }),
      setFilingFilter: (filter) => set((state) => ({ 
        filingFilter: { ...state.filingFilter, ...filter } 
      })),
      setFormType: (formType) => set((state) => ({
        filingFilter: { ...state.filingFilter, formType }
      })),
      setPeriod: (period) => set((state) => ({
        filingFilter: { ...state.filingFilter, period }
      })),
      setIsLoadingCompany: (isLoading) => set({ isLoadingCompany: isLoading }),
      setIsLoadingFinancials: (isLoading) => set({ isLoadingFinancials: isLoading }),
      setCompanyError: (error) => set({ companyError: error }),
      setFinancialsError: (error) => set({ financialsError: error }),
      
      resetCompanyData: () => set({
        selectedCompany: null,
        companyFilings: [],
        incomeStatement: null,
        balanceSheet: null,
        cashFlowStatement: null,
        companyError: null,
        financialsError: null
      }),
      
      resetFinancialData: () => set({
        incomeStatement: null,
        balanceSheet: null,
        cashFlowStatement: null,
        financialsError: null,
        isLoadingFinancials: false,
      }),
    }),
    {
      name: 'sec-filings-sankey-storage',
    }
  )
); 