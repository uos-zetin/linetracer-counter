import { CounterProvider } from "./counter-provider";
import { ProgressProvider } from "./progress-provider";
import { AuthProvider } from "./auth-provider";
import { RepositoryProvider } from "./repository-provider";
import { AdminCompetitionProvider } from "./admin-competition-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <RepositoryProvider>
        <CounterProvider>
          <ProgressProvider>
            <AdminCompetitionProvider>{children}</AdminCompetitionProvider>
          </ProgressProvider>
        </CounterProvider>
      </RepositoryProvider>
    </AuthProvider>
  );
};
