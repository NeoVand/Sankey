import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCompaniesByTicker } from '../services/api/companyApi';

/**
 * Custom hook for searching companies by ticker symbol
 */
export const useCompanySearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Use a simple timeout to debounce the search
    clearTimeout((window as any).searchDebounce);
    (window as any).searchDebounce = setTimeout(() => {
      setDebouncedSearchTerm(term);
    }, 500);
  };
  
  // Company search query
  const {
    data: searchResults = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['companySearch', debouncedSearchTerm],
    queryFn: () => searchCompaniesByTicker(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle search submission (can be used for immediate search)
  const handleSubmitSearch = () => {
    if (searchTerm.length >= 2) {
      setDebouncedSearchTerm(searchTerm);
    }
  };
  
  return {
    searchTerm,
    searchResults,
    isLoading,
    isError,
    error,
    handleSearch,
    handleSubmitSearch,
    refetch
  };
}; 