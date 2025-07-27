import { useMemo } from "react";
import { CompetitionFetcherRepository } from "@/entities/competition";
import { DivisionFetcherRepository } from "@/entities/division";
import { ParticipantFetcherRepository } from "@/entities/participant";
import { RecordFetcherRepository } from "@/entities/record";
import { ManualRecordFetcherRepository } from "@/entities/manual-record";
import { UserFetcherRepository } from "@/entities/user";
import { CounterFetcherRepository } from "@/entities/counter";
import { TimerFetcherRepository } from "@/entities/timer";
import { useFetcher } from "./use-fetcher";
import { repositoryContext } from "./use-repository";

export const RepositoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { publicFetcher, authenticatedFetcher } = useFetcher();

  const repositories = useMemo(
    () => ({
      competitionRepository: new CompetitionFetcherRepository(publicFetcher, authenticatedFetcher),
      divisionRepository: new DivisionFetcherRepository(publicFetcher, authenticatedFetcher),
      participantRepository: new ParticipantFetcherRepository(publicFetcher, authenticatedFetcher),
      recordRepository: new RecordFetcherRepository(publicFetcher, authenticatedFetcher),
      manualRecordRepository: new ManualRecordFetcherRepository(publicFetcher, authenticatedFetcher),
      userRepository: new UserFetcherRepository(publicFetcher, authenticatedFetcher),
      counterRepository: new CounterFetcherRepository(authenticatedFetcher),
      timerRepository: new TimerFetcherRepository(publicFetcher, authenticatedFetcher),
    }),
    [publicFetcher, authenticatedFetcher]
  );

  return <repositoryContext.Provider value={repositories}>{children}</repositoryContext.Provider>;
};

