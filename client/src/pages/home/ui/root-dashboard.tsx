import { Link } from "react-router";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Clock, Settings } from "@/shared/ui";
import { useAuthService } from "@/features/auth";
import { AppHeader } from "@/widgets/app-header";
import { PageContainer } from "@/widgets/page-container";
export function RootDashboard() {
  const authService = useAuthService();
  const { user } = authService.use.auth();

  // 관리자 권한 확인
  const isAdmin = user?.roles.includes("administrator");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="계수기 시스템" showBackButton={false} />
      <main className="py-6">
        <PageContainer>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">대시보드</h2>
            <p className="mt-2 max-w-2xl mx-auto text-base text-muted-foreground sm:mt-3">원하는 기능을 선택하세요</p>
          </div>
          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">계수기 선택</CardTitle>
                      <CardDescription className="text-sm sm:text-base">타이머 시작 및 기록 관리</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="lg">
                    <Link to="/counter">계수기 선택하기</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-md flex items-center justify-center">
                      <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg sm:text-xl">관리자 페이지</CardTitle>
                      <CardDescription className="text-sm sm:text-base">시스템 관리 및 설정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild={isAdmin} className="w-full" size="lg" disabled={!isAdmin}>
                    {isAdmin ? <Link to="/admin">관리자 페이지 이동</Link> : <span>관리자 권한 필요</span>}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
}
