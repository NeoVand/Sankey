import axios from 'axios';

// Determine if we're in development or production environment
const isDevelopment = import.meta.env.DEV;

// Base URLs - use proxies in development, direct URLs in production
const SEC_BASE_URL = 'https://www.sec.gov';
const DATA_SEC_BASE_URL = 'https://data.sec.gov';

// EDGAR API endpoints
export const EDGAR_COMPANY_SUBMISSIONS_URL = isDevelopment 
  ? '/api/data-sec/submissions' 
  : `${DATA_SEC_BASE_URL}/submissions`;

export const EDGAR_COMPANY_FACTS_URL = isDevelopment 
  ? '/api/data-sec/api/xbrl/companyfacts' 
  : `${DATA_SEC_BASE_URL}/api/xbrl/companyfacts`;

export const EDGAR_COMPANY_CONCEPT_URL = isDevelopment 
  ? '/api/data-sec/api/xbrl/companyconcept' 
  : `${DATA_SEC_BASE_URL}/api/xbrl/companyconcept`;

// Create axios instance for SEC requests
export const secApi = axios.create({
  headers: {
    'Accept': 'application/json',
    // Add User-Agent header to comply with SEC fair access rules
    'User-Agent': 'SEC-Filings-Sankey-Visualizer/0.1.0 (educational project, neonarain@gmail.com)'
  },
});

// Create a request interceptor to handle rate limiting
secApi.interceptors.request.use(async (config) => {
  // Adding a small delay to respect SEC rate limits (10 requests/sec max)
  await new Promise(resolve => setTimeout(resolve, 150)); // ~6-7 requests per second
  
  // Add cache-busting parameter to prevent caching issues with SEC API
  if (config.url) {
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_cb=${Date.now()}`;
  }
  
  return config;
});

// Error handling interceptor
secApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error responses
      console.error('API Error:', error.response.status, error.response.data);
      
      if (error.response.status === 403) {
        console.error('Access denied. Please check your request headers and rate limits.');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
); 