"use client";
import React, { createContext, useContext, useState } from "react";

interface ResultsContextType {
  result: any | null;
  setResult: (data: any) => void;
}

const ResultsContext = createContext<ResultsContextType>({
  result: null,
  setResult: () => {},
});

export const ResultsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [result, setResult] = useState<any | null>(null);

  return (
    <ResultsContext.Provider value={{ result, setResult }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => useContext(ResultsContext);