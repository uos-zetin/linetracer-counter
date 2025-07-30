import { useMemo } from "react";
import { CompetitionFetcherRepository } from "@/entities/competition";
import { DivisionFetcherRepository } from "@/entities/division";
import { ParticipantFetcherRepository } from "@/entities/participant";
import { RecordFetcherRepository } from "@/entities/record";
import { ManualRecordFetcherRepository } from "@/entities/manual-record";
import { UserFetcherRepository } from "@/entities/user";
import { CounterFetcherRepository } from "@/entities/counter";
import { TimerFetcherRepository } from "@/entities/timer";
import { ProgressFetcherRepository } from "@/features/progress";
import { FetchApiFetcher, AuthenticatedFetcher, type SessionProvider } from "@/shared";
import { repositoryContext } from "./use-repository";

export const RepositoryProvider = ({ children }: { children: React.ReactNode }) => {
  const repositories = useMemo(() => {
    // Create base fetcher for public API calls
    const publicFetcher = new FetchApiFetcher("/api");
    
    // Create session provider for authentication
    const sessionProvider: SessionProvider = {
      getSessionKey: () => {
        // TODO: Implement proper session key retrieval from auth context
        return localStorage.getItem("sessionKey");
      }
    };
    
    // Create authenticated fetcher for protected API calls
    const authFetcher = new AuthenticatedFetcher(publicFetcher, sessionProvider);
    
    return {
      competitionRepository: new CompetitionFetcherRepository(publicFetcher, authFetcher),
      divisionRepository: new DivisionFetcherRepository(publicFetcher, authFetcher),
      participantRepository: new ParticipantFetcherRepository(publicFetcher, authFetcher),
      recordRepository: new RecordFetcherRepository(publicFetcher, authFetcher),
      manualRecordRepository: new ManualRecordFetcherRepository(publicFetcher, authFetcher),
      userRepository: new UserFetcherRepository(publicFetcher, authFetcher),
      counterRepository: new CounterFetcherRepository(authFetcher),
      timerRepository: new TimerFetcherRepository(publicFetcher, authFetcher),
      progressRepository: new ProgressFetcherRepository(publicFetcher, authFetcher),
    };
  }, []);

  return <repositoryContext.Provider value={repositories}>{children}</repositoryContext.Provider>;
};

