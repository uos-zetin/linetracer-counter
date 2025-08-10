import { useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthDebugWrapper, useAuthService } from "@/features/auth";
import { AppHeader } from "@/widgets/app-header";
import { PageContainer } from "@/widgets/page-container";
import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const authService = useAuthService();
  const { user, isAuthenticated } = authService.use.auth();

  // 관리자 권한 확인
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
      return;
    }

    const isAdmin = user?.roles.includes("administrator");
    if (!isAdmin) {
      navigate("/", { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // 인증되지 않았거나 관리자가 아닌 경우 로딩 표시
  if (!isAuthenticated || !user?.roles.includes("administrator")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthDebugWrapper>
      <div className="min-h-screen bg-background">
        <AppHeader title="관리자 페이지" showBackButton={true} backPath="/" />

        {/* Main Layout */}
        <main className="py-6">
          <PageContainer maxWidth="7xl" padding="md">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar - 모바일에서는 숨기거나 드로어로 */}
              <div className="w-full lg:w-64 lg:flex-shrink-0">
                <AdminSidebar />
              </div>

              {/* Main Content */}
              <div className="flex-1 bg-card shadow rounded-lg border">
                <div className="p-4 md:p-6">{children}</div>
              </div>
            </div>
          </PageContainer>
        </main>
      </div>
    </AuthDebugWrapper>
  );
}
