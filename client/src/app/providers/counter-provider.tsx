import {
  CounterFetcherRepository,
  CounterSocketIOChannel,
  type CounterChannel,
  type CounterRepository,
} from "@/entities/counter";
import { useFetcher } from "./fetcher-provider";
import { counterChannelContext, counterRepoContext } from "@/features/counter";

export const CounterProvider = ({ children }: { children: React.ReactNode }) => {
  const fetcher = useFetcher();
  const counterRepository: CounterRepository = new CounterFetcherRepository(fetcher.authenticatedFetcher);
  const counterChannel: CounterChannel = new CounterSocketIOChannel();

  const CounterRepoProvider = counterRepoContext.Provider;
  const CounterChannelProvider = counterChannelContext.Provider;

  return (
    <CounterRepoProvider value={counterRepository}>
      <CounterChannelProvider value={counterChannel}>{children}</CounterChannelProvider>
    </CounterRepoProvider>
  );
};
