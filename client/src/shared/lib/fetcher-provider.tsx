import { createContext, useContext } from "react";
import type { Fetcher } from "../api/fetcher";

interface FetcherContextValue {
  publicFetcher: Fetcher;
  authenticatedFetcher: Fetcher;
}

const FetcherContext = createContext<FetcherContextValue | undefined>(undefined);

export const createFetcherProvider = (publicFetcher: Fetcher, authenticatedFetcher: Fetcher) => {
  return function FetcherProvider({ children }: { children: React.ReactNode }) {
    return (
      <FetcherContext.Provider value={{ publicFetcher, authenticatedFetcher }}>{children}</FetcherContext.Provider>
    );
  };
};

export function useFetcher() {
  const ctx = useContext(FetcherContext);
  if (!ctx) throw new Error("useFetcher must be used within FetcherProvider");
  return ctx;
}
