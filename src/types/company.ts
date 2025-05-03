export interface CompanyInfo {
  cik: string;
  ticker: string;
  name: string;
  exchange?: string;
}

export interface CompanySearchResult {
  cik: string;
  ticker: string;
  name: string;
  exchange?: string;
}

export interface CompanyFilingInfo {
  form: string;
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  primaryDocument: string;
  description?: string;
} 