import { useAuthService } from "../model/context";

export function AuthDebugInfo() {
  const authService = useAuthService();
  const { user, isAuthenticated } = authService.useAuth();

  return (
    <div className="fixed top-[5vw] right-[1vw] bg-black bg-opacity-75 text-white p-[0.5vw] rounded-lg text-[1.5vw] max-w-[20vw] z-40">
      <h4 className="font-bold mb-[0.25vw] text-[1.75vw]">인증 디버그</h4>
      <div className="space-y-[0.1vw] text-[1.25vw]">
        <div>
          <strong>인증:</strong> {isAuthenticated ? "✅" : "❌"}
        </div>
        <div>
          <strong>사용자:</strong> {user ? user.name : "없음"}
        </div>
        <div>
          <strong>ID:</strong> {user?.id || "없음"}
        </div>
        <div>
          <strong>권한:</strong> {user?.roles?.join(", ") || "없음"}
        </div>
        <div>
          <strong>생성:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "없음"}
        </div>
      </div>
    </div>
  );
}

// 개발 모드에서만 표시되는 래퍼 컴포넌트
export function AuthDebugWrapper({ children }: { children: React.ReactNode }) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <>
      {children}
      {isDevelopment && <AuthDebugInfo />}
    </>
  );
}
