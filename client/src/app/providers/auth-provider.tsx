import { useEffect, useMemo } from "react";
import { FetchApiFetcher, AuthenticatedFetcher } from "@/shared/api";
import { UserFetcherRepository } from "@/entities/user";
import {
  createAuthService,
  authServiceContext,
  AuthServiceSessionProvider,
  AuthFetcherRepository,
  type AuthService,
} from "@/features/auth";
import { FetcherProvider } from "./fetcher-provider";

const AuthProviderInner = ({ authService, children }: { authService: AuthService; children: React.ReactNode }) => {
  // 세션 복원
  useEffect(() => {
    authService.auth.restoreSession().catch((error) => {
      console.warn("세션 복원 실패:", error);
    });
  }, [authService]);

  return <>{children}</>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // 1. 환경 설정과 fetcher 생성
  // localhost 환경에서는 프록시 사용 (dev, preview 모두 포함)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const fetcherBaseUrl = (import.meta.env.DEV || isLocalhost) 
    ? "/api" 
    : import.meta.env.VITE_SERVER_URL + "/api";
  
  // 디버깅용 로그 제거됨

  const { publicFetcher, authenticatedFetcher, authService } = useMemo(() => {
    const publicFetcher = new FetchApiFetcher(fetcherBaseUrl);

    // 2. Repositories 생성
    const authenticatedFetcher = new AuthenticatedFetcher(publicFetcher);
    const userRepository = new UserFetcherRepository(authenticatedFetcher);
    const authRepository = new AuthFetcherRepository(publicFetcher, authenticatedFetcher);

    // 3. AuthService 생성
    const authService: AuthService = createAuthService({ userRepository, authRepository });

    // 4. SessionProvider 어댑터 생성 및 주입
    const sessionProvider = new AuthServiceSessionProvider(authService);
    authenticatedFetcher.setSessionProvider(sessionProvider);

    return { publicFetcher, authenticatedFetcher, authService };
  }, [fetcherBaseUrl]);

  return (
    <authServiceContext.Provider value={authService}>
      <FetcherProvider publicFetcher={publicFetcher} authenticatedFetcher={authenticatedFetcher}>
        <AuthProviderInner authService={authService}>{children}</AuthProviderInner>
      </FetcherProvider>
    </authServiceContext.Provider>
  );
};
