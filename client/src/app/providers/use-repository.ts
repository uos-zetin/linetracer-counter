import { createContext, useContext } from "react";
import type { CompetitionRepository } from "@/entities/competition";
import type { CounterRepository } from "@/entities/counter";
import type { DivisionRepository } from "@/entities/division";
import type { ManualRecordRepository } from "@/entities/manual-record";
import type { ParticipantRepository } from "@/entities/participant";
import type { RecordRepository } from "@/entities/record";
import type { TimerRepository } from "@/entities/timer";
import type { UserRepository } from "@/entities/user";
import type { ProgressRepository } from "@/features/progress";

export interface RepositoryContext {
  competitionRepository: CompetitionRepository;
  divisionRepository: DivisionRepository;
  participantRepository: ParticipantRepository;
  recordRepository: RecordRepository;
  manualRecordRepository: ManualRecordRepository;
  userRepository: UserRepository;
  counterRepository: CounterRepository;
  timerRepository: TimerRepository;
  progressRepository: ProgressRepository;
}

export const repositoryContext = createContext<RepositoryContext | null>(null);

export function useRepository(): RepositoryContext {
  const ctx = useContext(repositoryContext);
  if (!ctx) throw new Error("useRepository must be used within RepositoryProvider");
  return ctx;
}
