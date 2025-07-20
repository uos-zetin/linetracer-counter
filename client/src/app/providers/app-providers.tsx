import { createStopwatchProvider } from "entities/stopwatch";
import { UserProvider } from "./user-provider";

// Stopwatch Provider 생성
const StopwatchProvider = createStopwatchProvider();

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <StopwatchProvider>{children}</StopwatchProvider>
    </UserProvider>
  );
};
