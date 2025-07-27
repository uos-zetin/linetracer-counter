import { useEffect } from "react";
import { FetchApiFetcher, AuthenticatedFetcher } from "@/shared";
import { UserFetcherRepository } from "@/entities/user";
import { createAuthService, authServiceContext, AuthServiceSessionProvider, type AuthService } from "@/features/auth";
import { createFetcherProvider } from "./fetcher-provider";

const AuthProviderInner = ({ authService, children }: { authService: AuthService; children: React.ReactNode }) => {
  // 세션 복원
  useEffect(() => {
    authService.restoreSession().catch((error) => {
      console.warn("세션 복원 실패:", error);
    });
  }, [authService]);

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. 환경 설정과 fetcher 생성
  const fetcherBaseUrl = import.meta.env.DEV ? "/api" : import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  const publicFetcher = new FetchApiFetcher(fetcherBaseUrl);

  // 2. UserRepository 생성
  const authenticatedFetcher = new AuthenticatedFetcher(publicFetcher);
  const userRepository = new UserFetcherRepository(publicFetcher, authenticatedFetcher);

  // 3. AuthService 생성
  const authService: AuthService = createAuthService({ userRepository });

  // 4. SessionProvider 어댑터 생성 및 주입
  const sessionProvider = new AuthServiceSessionProvider(authService);
  authenticatedFetcher.setSessionProvider(sessionProvider);

  // 5. Fetcher Context 제공
  const FetcherProvider = createFetcherProvider(publicFetcher, authenticatedFetcher);

  return (
    <authServiceContext.Provider value={authService}>
      <FetcherProvider>
        <AuthProviderInner authService={authService}>{children}</AuthProviderInner>
      </FetcherProvider>
    </authServiceContext.Provider>
  );
};
