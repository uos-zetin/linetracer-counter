import { CounterProvider } from "./counter-provider";
import { ProgressProvider } from "./progress-provider";
import { AuthProvider } from "./auth-provider";
import { RepositoryProvider } from "./repository-provider";
import { AdminCompetitionProvider } from "./admin-competition-provider";
import { AdminDivisionProvider } from "./admin-division-provider";
import { AdminParticipantProvider } from "./admin-participant-provider";
import { composeProviders } from "./compose-providers";
import { AdminRecordProvider } from "./admin-record-provider";

const ComposedProviders = composeProviders(
  AuthProvider,
  RepositoryProvider,
  CounterProvider,
  ProgressProvider,
  AdminCompetitionProvider,
  AdminDivisionProvider,
  AdminParticipantProvider,
  AdminRecordProvider,
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ComposedProviders>{children}</ComposedProviders>;
};
