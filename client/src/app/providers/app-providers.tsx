import { CounterProvider } from "./counter-provider";
import { ProgressProvider } from "./progress-provider";
import { AuthProvider } from "./auth-provider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <CounterProvider>
        <ProgressProvider>{children}</ProgressProvider>
      </CounterProvider>
    </AuthProvider>
  );
};
