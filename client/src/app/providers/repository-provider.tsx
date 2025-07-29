import { useMemo } from "react";
import { MockCompetitionRepository } from "@/entities/competition";
import { MockDivisionRepository } from "@/entities/division";
import { MockParticipantRepository } from "@/entities/participant";
import { MockRecordRepository } from "@/entities/record";
import { MockManualRecordRepository } from "@/entities/manual-record";
import { MockUserRepository } from "@/entities/user";
import { MockCounterRepository } from "@/entities/counter";
import { MockTimerRepository } from "@/entities/timer";
import { repositoryContext } from "./use-repository";

export const RepositoryProvider = ({ children }: { children: React.ReactNode }) => {
  const repositories = useMemo(
    () => ({
      competitionRepository: new MockCompetitionRepository(),
      divisionRepository: new MockDivisionRepository(),
      participantRepository: new MockParticipantRepository(),
      recordRepository: new MockRecordRepository(),
      manualRecordRepository: new MockManualRecordRepository(),
      userRepository: new MockUserRepository(),
      counterRepository: new MockCounterRepository(),
      timerRepository: new MockTimerRepository(),
    }),
    []
  );

  return <repositoryContext.Provider value={repositories}>{children}</repositoryContext.Provider>;
};

