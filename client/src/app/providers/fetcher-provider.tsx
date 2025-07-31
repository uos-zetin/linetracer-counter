import type { Fetcher } from "@/shared/api/fetcher";
import { fetcherContext } from "./use-fetcher";

interface FetcherProviderProps {
  children: React.ReactNode;
  publicFetcher: Fetcher;
  authenticatedFetcher: Fetcher;
}

export const FetcherProvider = ({ children, publicFetcher, authenticatedFetcher }: FetcherProviderProps) => {
  return (
    <fetcherContext.Provider value={{ fetcher: publicFetcher, authFetcher: authenticatedFetcher }}>
      {children}
    </fetcherContext.Provider>
  );
};
