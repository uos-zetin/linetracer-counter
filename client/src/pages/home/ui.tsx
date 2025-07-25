import { useAuthService } from "@/features/auth";
import { LoginForm, AuthDebugWrapper } from "@/features/auth";
import { RootDashboard } from "./ui/root-dashboard";

export function HomePage() {
  const authService = useAuthService();
  const { isAuthenticated } = authService.useAuth();

  return (
    <AuthDebugWrapper>
      {/* 인증되지 않은 경우 로그인 폼 표시 */}
      {!isAuthenticated ? <LoginForm /> : <RootDashboard />}
    </AuthDebugWrapper>
  );
}
