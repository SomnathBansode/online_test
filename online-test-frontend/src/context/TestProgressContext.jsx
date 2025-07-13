import React, { createContext, useContext, useState, useEffect } from 'react';

const TestProgressContext = createContext();

export const useTestProgress = () => {
  const context = useContext(TestProgressContext);
  if (!context) {
    throw new Error('useTestProgress must be used within a TestProgressProvider');
  }
  return context;
};

export const TestProgressProvider = ({ children }) => {
  const [testInProgress, setTestInProgress] = useState(() => {
    // Initialize state from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('testInProgress');
      return saved === 'true';
    }
    return false;
  });
  
  // Persist test progress state across page refreshes
  useEffect(() => {
    localStorage.setItem('testInProgress', testInProgress.toString());
  }, [testInProgress]);

  const updateTestProgress = (value) => {
    setTestInProgress(value);
  };

  return (
    <TestProgressContext.Provider 
      value={{ 
        testInProgress, 
        setTestInProgress: updateTestProgress 
      }}
    >
      {children}
    </TestProgressContext.Provider>
  );
};