import { useUserStoreHook } from "@/entities/user";
import { LoginForm, AuthDebugWrapper } from "@/features/auth";
import { RootDashboard } from "./ui/root-dashboard";

export function HomePage() {
  const userStoreHook = useUserStoreHook();
  const isAuthenticated = userStoreHook((state) => state.isAuthenticated);

  return (
    <AuthDebugWrapper>
      {/* 인증되지 않은 경우 로그인 폼 표시 */}
      {!isAuthenticated ? <LoginForm /> : <RootDashboard />}
    </AuthDebugWrapper>
  );
}
