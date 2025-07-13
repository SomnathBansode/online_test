// src/context/LoadingContext.jsx
import { createContext, useContext, useState } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const value = {
    loading,
    loadingText,
    show: (text = '') => {
      setLoading(true);
      setLoadingText(text);
    },
    hide: () => {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);