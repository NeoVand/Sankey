import axios from 'axios';

// EDGAR API base URLs
export const EDGAR_COMPANY_SUBMISSIONS_URL = '/api/data-sec/submissions';
export const EDGAR_COMPANY_FACTS_URL = '/api/data-sec/api/xbrl/companyfacts';
export const EDGAR_COMPANY_CONCEPT_URL = '/api/data-sec/api/xbrl/companyconcept';

// Create axios instance for SEC requests
export const secApi = axios.create({
  headers: {
    'Accept': 'application/json',
  },
});

// Create a request interceptor to handle rate limiting
secApi.interceptors.request.use(async (config) => {
  // Adding a small delay to respect SEC rate limits (10 requests/sec max)
  await new Promise(resolve => setTimeout(resolve, 150)); // ~6-7 requests per second
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