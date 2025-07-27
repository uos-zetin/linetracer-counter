import { CounterProvider } from "./counter-provider";
import { ProgressProvider } from "./progress-provider";
import { AuthProvider } from "./auth-provider";
import { RepositoryProvider } from "./repository-provider";
import { AdminCompetitionProvider } from "./admin-competition-provider";
import { composeProviders } from "./compose-providers";

const ComposedProviders = composeProviders(
  AuthProvider,
  RepositoryProvider,
  CounterProvider,
  ProgressProvider,
  AdminCompetitionProvider
);

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <ComposedProviders>{children}</ComposedProviders>;
};
