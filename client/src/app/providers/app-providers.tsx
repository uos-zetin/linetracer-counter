import { AdminCompetitionProvider } from "./admin-competition-provider";
import { AdminDivisionProvider } from "./admin-division-provider";
import { AdminParticipantProvider } from "./admin-participant-provider";
import { AdminRecordProvider } from "./admin-record-provider";
import { AdminUserProvider } from "./admin-user-provider";
import { AuthProvider } from "./auth-provider";
import { CompetitionProvider } from "./competition-provider";
import { composeProviders } from "./compose-providers";
import { CounterProvider } from "./counter-provider";
import { DivisionProvider } from "./division-provider";
import { ManualRecordProvider } from "./manual-record-provider";
import { ParticipantProvider } from "./participant-provider";
import { ProgressProvider } from "./progress-provider";
import { RecordControlProvider } from "./record-control-provider";
import { RecordProvider } from "./record-provider";
import { RepositoryProvider } from "./repository-provider";
import { TimerControlProvider } from "./timer-control-provicer";

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
  ManualRecordProvider
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ComposedProviders>{children}</ComposedProviders>;
};
