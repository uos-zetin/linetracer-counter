import { AuthProvider } from "./auth-provider";
import { CompetitionProvider } from "./competition-provider";
import { composeProviders } from "./compose-providers";
import { CounterProvider } from "./counter-provider";
import { DivisionProvider } from "./division-provider";
import { ManualRecordProvider } from "./manual-record-provider";
import { ParticipantProvider } from "./participant-provider";
import { ProgressProvider } from "./progress-provider";
import { RecordProvider } from "./record-provider";
import { RepositoryProvider } from "./repository-provider";
import { TimerControlProvider } from "./timer-control-provicer";
import { UserProvider } from "./user-provider";

const ComposedProviders = composeProviders(
  AuthProvider,
  RepositoryProvider,
  CompetitionProvider,
  DivisionProvider,
  ParticipantProvider,
  RecordProvider,
  CounterProvider,
  ProgressProvider,
  UserProvider,
  TimerControlProvider,
  ManualRecordProvider
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ComposedProviders>{children}</ComposedProviders>;
};
