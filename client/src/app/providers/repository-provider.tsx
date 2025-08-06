import { useMemo } from "react";
import { CompetitionFetcherRepository } from "@/entities/competition";
import { CounterFetcherRepository } from "@/entities/counter";
import { DivisionFetcherRepository } from "@/entities/division";
import { ManualRecordFetcherRepository } from "@/entities/manual-record";
import { ParticipantFetcherRepository } from "@/entities/participant";
import { RecordFetcherRepository } from "@/entities/record";
import { TimerFetcherRepository } from "@/entities/timer";
import { UserFetcherRepository } from "@/entities/user";
import { ProgressFetcherRepository } from "@/features/progress";
import { useFetcher } from "./use-fetcher";
import { repositoryContext } from "./use-repository";

export const RepositoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { fetcher, authFetcher } = useFetcher();

  const repositories = useMemo(() => {
    return {
      competitionRepository: new CompetitionFetcherRepository(fetcher, authFetcher),
      divisionRepository: new DivisionFetcherRepository(fetcher, authFetcher),
      participantRepository: new ParticipantFetcherRepository(fetcher, authFetcher),
      recordRepository: new RecordFetcherRepository(fetcher, authFetcher),
      manualRecordRepository: new ManualRecordFetcherRepository(fetcher, authFetcher),
      userRepository: new UserFetcherRepository(fetcher, authFetcher),
      counterRepository: new CounterFetcherRepository(authFetcher),
      timerRepository: new TimerFetcherRepository(fetcher, authFetcher),
      progressRepository: new ProgressFetcherRepository(fetcher, authFetcher),
    };
  }, [fetcher, authFetcher]);

  return <repositoryContext.Provider value={repositories}>{children}</repositoryContext.Provider>;
};
