import type { ProgressChannel, ProgressService } from "@/features/progress";
// import { useFetcher } from "./fetcher-provider";
import { createProgressService, progressServiceContext } from "@/features/progress";
import { ProgressSocketIOChannel } from "@/features/progress";

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
  // const fetcher = useFetcher();
  // const progressRepository: ProgressRepository = new ProgressFetcherRepository(fetcher.authenticatedFetcher);
  const progressChannel: ProgressChannel = new ProgressSocketIOChannel();

  const progressService: ProgressService = createProgressService({
    // progressRepository,
    progressChannel,
  });
  const ProgressServiceProvider = progressServiceContext.Provider;

  return <ProgressServiceProvider value={progressService}>{children}</ProgressServiceProvider>;
};
