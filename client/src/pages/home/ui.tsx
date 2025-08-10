import { useAuthService, AuthDebugWrapper } from "@/features/auth";
import { LoginForm } from "./ui/login-form";
import { RootDashboard } from "./ui/root-dashboard";

export function HomePage() {
  const authService = useAuthService();
  const { isAuthenticated } = authService.use.auth();

  return (
    <AuthDebugWrapper>
      {/* 인증되지 않은 경우 로그인 폼 표시 */}
      {!isAuthenticated ? <LoginForm /> : <RootDashboard />}
    </AuthDebugWrapper>
  );
}
