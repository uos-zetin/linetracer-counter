import { userRepository, setSessionKeyGetter } from "../api/factory";
import { createZustandUserStore } from "./slice.zustand";
import type { UserStore } from "./types";
import type { UserRepository } from "../api/types";

/**
 * UserStore 인스턴스를 생성하는 팩토리 함수
 */
export const createUserStore = (customRepository?: UserRepository): UserStore => {
  return createZustandUserStore(customRepository || userRepository);
};

/**
 * 기본 UserStore 인스턴스
 * 애플리케이션 전역에서 사용할 기본 인스턴스
 */
export const userStore = createUserStore();

// Repository의 AuthenticatedFetcher가 세션 키를 가져올 수 있도록 설정
setSessionKeyGetter(() => {
  const zustandStore = userStore as ReturnType<typeof createZustandUserStore>;
  return zustandStore.getSessionKey();
});

// 앱 시작 시 세션 복원 시도
userStore.restoreSession().catch(() => {
  // 세션 복원 실패 시 무시 (로그인되지 않은 상태로 시작)
});

/**
 * React 컴포넌트에서 zustand hook을 직접 사용하는 경우
 * (선택적으로 제공)
 */
export const useUserStoreHook = () => {
  const zustandStore = userStore as ReturnType<typeof createZustandUserStore>;
  return zustandStore.useZustandStore();
};
