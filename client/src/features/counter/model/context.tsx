import { createContext, useContext } from "react";
import type { CounterChannel, CounterRepository } from "@/entities/counter";

export const counterRepoContext = createContext<CounterRepository | null>(null);
export const counterChannelContext = createContext<CounterChannel | null>(null);

export const useCounterRepo = () => {
  const repo = useContext(counterRepoContext);
  if (!repo) {
    throw new Error("CounterRepository is not provided");
  }
  return repo;
};

export const useCounterChannel = () => {
  const channel = useContext(counterChannelContext);
  if (!channel) {
    throw new Error("CounterChannel is not provided");
  }
  return channel;
};
