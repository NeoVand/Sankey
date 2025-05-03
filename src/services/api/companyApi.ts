import { secApi, EDGAR_COMPANY_SUBMISSIONS_URL } from './apiConfig';
import { CompanyInfo, CompanyFilingInfo } from '../../types/company';

/**
 * Pad a CIK number with leading zeros to 10 digits
 */
const padCik = (cik: string): string => {
  return cik.padStart(10, '0');
};

/**
 * Get company information and filings by CIK
 */
export const getCompanyInfo = async (cik: string): Promise<{
  companyInfo: CompanyInfo;
  filings: CompanyFilingInfo[];
}> => {
  try {
    const paddedCik = padCik(cik);
    const response = await secApi.get(`${EDGAR_COMPANY_SUBMISSIONS_URL}/CIK${paddedCik}.json`);
    
    const companyData = response.data;
    
    const companyInfo: CompanyInfo = {
      cik: cik,
      ticker: companyData.tickers?.[0] || '',
      name: companyData.name,
      exchange: companyData.exchanges?.[0] || '',
    };
    
    // Extract recent filings
    const filings: CompanyFilingInfo[] = companyData.filings?.recent?.form
      ? companyData.filings.recent.form.map((form: string, index: number) => ({
          form,
          filingDate: companyData.filings.recent.filingDate[index],
          reportDate: companyData.filings.recent.reportDate[index],
          accessionNumber: companyData.filings.recent.accessionNumber[index],
          primaryDocument: companyData.filings.recent.primaryDocument[index],
          description: companyData.filings.recent.primaryDocDescription?.[index],
        }))
      : [];
    
    return { companyInfo, filings };
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
};

/**
 * Search companies by ticker symbol
 * Due to SEC API limitations, we'll use external sources for company search
 */
export const searchCompaniesByTicker = async (ticker: string): Promise<CompanyInfo[]> => {
  try {
    // Use the SEC company tickers mapping file through our proxy
    const response = await fetch('/api/sec/files/company_tickers.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch company tickers');
    }
    
    const data = await response.json();
    
    // Convert the object to an array
    const companies = Object.values(data as Record<string, any>);
    
    // Filter companies by ticker (case insensitive)
    const filteredCompanies = companies.filter(
      company => company.ticker.toLowerCase().includes(ticker.toLowerCase())
    );
    
    // Map to CompanyInfo format
    return filteredCompanies.map(company => ({
      cik: company.cik_str.toString(),
      ticker: company.ticker,
      name: company.title,
    }));
  } catch (error) {
    console.error('Error searching companies:', error);
    throw error;
  }
}; 