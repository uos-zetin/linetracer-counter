import { useAuthService } from "../model/context";

export function AuthDebugInfo() {
  const authService = useAuthService();
  const { user, isAuthenticated } = authService.useAuth();

  return (
    <div className="fixed top-16 right-4 bg-black bg-opacity-75 text-white rounded-lg z-40 transition-all duration-300 ease-in-out hover:scale-100 scale-75 origin-top-right group">
      {/* 최소화된 상태 - 호버하지 않을 때 */}
      <div className="group-hover:hidden p-2 text-sm">
        <div className="flex items-center space-x-2">
          <span>🔐</span>
          <span>{isAuthenticated ? "✅" : "❌"}</span>
        </div>
      </div>
      
      {/* 확장된 상태 - 호버할 때 */}
      <div className="hidden group-hover:block p-4 min-w-[250px]">
        <h4 className="font-bold mb-2 text-lg">인증 디버그</h4>
        <div className="space-y-1 text-sm">
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
