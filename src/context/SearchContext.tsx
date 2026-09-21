import { createContext, useContext } from 'react';

interface SearchContextValue {
  search: string;
  setSearch: (value: string) => void;
}

export const SearchContext = createContext<SearchContextValue>({
  search: '',
  setSearch: () => undefined
});

export function useSearch(): SearchContextValue {
  return useContext(SearchContext);
}