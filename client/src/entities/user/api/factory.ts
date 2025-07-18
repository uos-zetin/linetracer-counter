import { fetcher, AuthenticatedFetcher } from "@/shared";
import type { Fetcher, SessionProvider } from "@/shared";
import { UserRepositoryImpl } from "./repository";
import type { UserRepository } from "./types";

/**
 * UserStore에서 세션 키를 가져오는 SessionProvider
 * 함수형으로 의존성을 주입받아 순환 참조 방지
 */
export class UserSessionProvider implements SessionProvider {
  private getSessionKeyFn: (() => string | null) | null = null;

  setSessionKeyGetter(fn: () => string | null): void {
    this.getSessionKeyFn = fn;
  }

  getSessionKey(): string | null {
    return this.getSessionKeyFn?.() || null;
  }
}

// 전역 세션 프로바이더 인스턴스
const sessionProvider = new UserSessionProvider();

/**
 * UserRepository 인스턴스를 생성하는 팩토리 함수
 */
export const createUserRepository = (
  customPublicFetcher?: Fetcher,
  customAuthenticatedFetcher?: Fetcher,
): UserRepository => {
  const publicFetcher = customPublicFetcher || fetcher;
  const authenticatedFetcher = customAuthenticatedFetcher || new AuthenticatedFetcher(fetcher, sessionProvider);

  return new UserRepositoryImpl(publicFetcher, authenticatedFetcher);
};

/**
 * 기본 UserRepository 인스턴스
 * 일반적인 사용 시에는 이 인스턴스를 사용
 */
export const userRepository = createUserRepository();

/**
 * UserStore가 생성된 후 호출하여 세션 키 getter를 설정
 */
export const setSessionKeyGetter = (fn: () => string | null): void => {
  sessionProvider.setSessionKeyGetter(fn);
};
