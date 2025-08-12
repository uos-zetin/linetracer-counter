import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { User } from "@/entities/user";
import { useAuthService } from "@/features/auth";

interface AdminAuthorizationResult {
  isAuthenticated: boolean;
  isAdministrator: boolean;
  user: User | null;
  sessionKey: string | null;
  isAuthorized: boolean;
}

/**
 * Administrator 권한 체크 및 자동 리다이렉트 처리를 담당하는 커스텀 훅
 */
export const useAdminAuthorization = (): AdminAuthorizationResult => {
  const navigate = useNavigate();
  const authService = useAuthService();
  const authState = authService.use.auth();
  const { isAuthenticated, user } = authState;

  const isAdministrator = user?.roles?.includes("administrator") ?? false;
  const sessionKey = authService.session.getSessionKey();
  const isAuthorized = isAuthenticated && isAdministrator;

  // 권한이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!isAuthenticated || (user && !isAdministrator)) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, isAdministrator, navigate]);

  return {
    isAuthenticated,
    isAdministrator,
    user,
    sessionKey,
    isAuthorized,
  };
};
