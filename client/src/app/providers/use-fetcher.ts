import { createContext, useContext } from "react";
import type { Fetcher } from "@/shared/api";

export interface FetcherContext {
  fetcher: Fetcher;
  authFetcher: Fetcher;
}

export const fetcherContext = createContext<FetcherContext | null>(null);

export function useFetcher(): FetcherContext {
  const ctx = useContext(fetcherContext);
  if (!ctx) throw new Error("useFetcher must be used within FetcherProvider");
  return ctx;
}
