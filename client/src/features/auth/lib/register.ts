import { userStore } from "@/entities/user";
import { validateRegisterForm } from "./validation";
import { ClientError, ServerError, NetworkError } from "@/shared/api/errors";
import type { RegisterFormData } from "../types";
import type { User } from "@/entities/user";

/**
 * 회원가입 실행
 * 클라이언트 검증 + 실제 회원가입 처리
 */
export const registerUser = async (formData: RegisterFormData): Promise<User> => {
  // 1. 클라이언트 측 폼 검증
  const validation = validateRegisterForm(formData);
  if (!validation.isValid) {
    const errorMessages = validation.errors.map((error) => error.message).join(", ");
    throw new Error(`입력 오류: ${errorMessages}`);
  }

  // 2. 실제 회원가입 수행 (자동 로그인 포함)
  try {
    const user = await userStore.register(formData.name, formData.userName, formData.password);
    return user;
  } catch (error) {
    // 타입 기반 에러 처리
    if (error instanceof ClientError) {
      // 클라이언트 에러 (400번대)
      if (error.statusCode === 409) {
        throw new Error("이미 사용 중인 사용자명입니다.");
      }
      if (error.statusCode === 400) {
        throw new Error("입력된 정보가 올바르지 않습니다.");
      }
      throw new Error("회원가입 요청에 문제가 있습니다.");
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
    throw new Error("회원가입 중 알 수 없는 오류가 발생했습니다.");
  }
};

/**
 * 사용자명 중복 확인 (선택적 기능)
 * 현재는 실제 API가 없으므로 미구현
 */
export const checkUserNameAvailability = async (_userName: string): Promise<boolean> => {
  // TODO: 실제 API 호출로 사용자명 중복 확인
  // 현재는 클라이언트 측 검증만 수행
  return true;
};
