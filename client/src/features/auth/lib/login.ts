import { userStore } from "@/entities/user";
import { validateLoginForm } from "./validation";
import { ClientError, ServerError, NetworkError } from "@/shared/api/errors";
import type { LoginFormData } from "../types";
import type { User } from "@/entities/user";

/**
 * 로그인 실행
 * 클라이언트 검증 + 실제 로그인 처리
 */
export const loginUser = async (formData: LoginFormData): Promise<User> => {
  // 1. 클라이언트 측 폼 검증
  const validation = validateLoginForm(formData);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map((error) => error.message).join(", ");
    throw new Error(`입력 오류: ${errorMessages}`);
  }

  // 2. 실제 로그인 수행
  try {
    const user = await userStore.login(formData.userName, formData.password);
    return user;
  } catch (error) {
    // 타입 기반 에러 처리
    if (error instanceof ClientError) {
      // 클라이언트 에러 (400번대)
      if (error.statusCode === 401) {
        throw new Error("사용자명 또는 비밀번호가 올바르지 않습니다.");
      }
      throw new Error("로그인 요청에 문제가 있습니다.");
    }

    if (error instanceof ServerError) {
      // 서버 에러 (500번대)
      throw new Error("서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }

    if (error instanceof NetworkError) {
      // 네트워크 에러
      throw new Error(error.message);
    }

    // 기타 에러
    throw new Error("로그인 중 알 수 없는 오류가 발생했습니다.");
  }
};

/**
 * 로그아웃 실행
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await userStore.logout();
  } catch (error) {
    // 로그아웃은 실패해도 로컬 상태는 정리되므로 에러를 조용히 처리
    console.warn("로그아웃 API 호출 실패:", error);
  }
};

/**
 * 현재 로그인 상태 확인
 */
export const checkAuthStatus = () => {
  return {
    user: userStore.getUser(),
    isAuthenticated: userStore.getIsAuthenticated(),
  };
};

/**
 * 세션 복원 (앱 시작 시 호출)
 */
export const restoreSession = async (): Promise<User | null> => {
  try {
    return await userStore.restoreSession();
  } catch (error) {
    console.warn("세션 복원 실패:", error);
    return null;
  }
};
