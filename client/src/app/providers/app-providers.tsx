import { CounterProvider } from "./counter-provider";
import { UserProvider } from "./user-provider";

// Stopwatch Provider 생성

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <CounterProvider>{children}</CounterProvider>
    </UserProvider>
  );
};
