import { FetchApiFetcher, AuthenticatedFetcher, createFetcherProvider } from "@/shared";
import { UserRepositoryImpl } from "@/entities/user";
import { createUserProvider } from "@/entities/user";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. 환경 설정과 fetcher 생성
  const fetcherBaseUrl = import.meta.env.DEV ? "/api" : import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const publicFetcher = new FetchApiFetcher(fetcherBaseUrl);

  // 2. authenticatedFetcher와 UserRepository 생성
  const authenticatedFetcher = new AuthenticatedFetcher(publicFetcher);
  const userRepository = new UserRepositoryImpl(publicFetcher, authenticatedFetcher);

  // 3. UserProvider와 sessionProvider 생성
  const { UserProvider: UserContextProvider, sessionProvider } = createUserProvider(userRepository);

  // 4. authenticatedFetcher에 sessionProvider 주입
  authenticatedFetcher.setSessionProvider(sessionProvider);

  // 5. Fetcher Context 제공
  const FetcherProvider = createFetcherProvider(publicFetcher, authenticatedFetcher);

  return (
    <UserContextProvider>
      <FetcherProvider>{children}</FetcherProvider>
    </UserContextProvider>
  );
};
