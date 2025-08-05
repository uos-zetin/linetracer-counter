import { CounterProvider } from "./counter-provider";
import { ProgressProvider } from "./progress-provider";
import { AuthProvider } from "./auth-provider";
import { RepositoryProvider } from "./repository-provider";
import { CompetitionProvider } from "./competition-provider";
import { DivisionProvider } from "./division-provider";
import { ParticipantProvider } from "./participant-provider";
import { RecordProvider } from "./record-provider";
import { AdminCompetitionProvider } from "./admin-competition-provider";
import { AdminDivisionProvider } from "./admin-division-provider";
import { AdminParticipantProvider } from "./admin-participant-provider";
import { composeProviders } from "./compose-providers";
import { AdminRecordProvider } from "./admin-record-provider";
import { AdminUserProvider } from "./admin-user-provider";
import { TimerControlProvider } from "./timer-control-provicer";
import { RecordControlProvider } from "./record-control-provider";
import { ManualRecordProvider } from "./manual-record-provider";

const ComposedProviders = composeProviders(
  AuthProvider,
  RepositoryProvider,
  CompetitionProvider,
  DivisionProvider,
  ParticipantProvider,
  RecordProvider,
  CounterProvider,
  ProgressProvider,
  AdminCompetitionProvider,
  AdminDivisionProvider,
  AdminParticipantProvider,
  AdminRecordProvider,
  AdminUserProvider,
  TimerControlProvider,
  RecordControlProvider,
  ManualRecordProvider,
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ComposedProviders>{children}</ComposedProviders>;
};
