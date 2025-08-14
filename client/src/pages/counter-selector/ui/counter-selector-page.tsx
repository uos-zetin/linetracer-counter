import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Settings,
  Play,
  Clock,
  Timer,
} from "@/shared/ui";
import { useAuthService } from "@/features/auth";
import { useCounterService } from "@/features/counter";
import { useErrorHandlingService } from "@/features/error-handling";
import { AppHeader } from "@/widgets/app-header";
import { PageContainer } from "@/widgets/page-container";

export function CounterSelectorPage() {
  const navigate = useNavigate();
  const counterService = useCounterService();
  const authService = useAuthService();
  const errorHandler = useErrorHandlingService();

  const counters = counterService.use.counters();
  const [selectedCounterId, setSelectedCounterId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const authState = authService.use.auth();
  const currentUser = authState.user;
  const userRoles = currentUser?.roles || [];

  // 권한 체크
  const isAdministrator = userRoles.includes("administrator");
  const isManualRecorder = userRoles.includes("manualRecorder");
  const hasValidRole = isAdministrator || isManualRecorder || userRoles.length > 0;

  // 권한이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!currentUser || !hasValidRole) {
      navigate("/");
      return;
    }
  }, [currentUser, hasValidRole, navigate]);

  // 카운터 목록 로드
  useEffect(() => {
    const loadCounters = async () => {
      if (!currentUser || !hasValidRole) return;

      try {
        setIsLoading(true);
        await counterService.load.all();
      } catch (error) {
        errorHandler.handle(error as Error, "계수기 목록을 불러오는데 실패했습니다");
      } finally {
        setIsLoading(false);
      }
    };

    loadCounters();
  }, [counterService, errorHandler, currentUser, hasValidRole]);

  const handleNavigation = (path: string) => {
    if (selectedCounterId) {
      navigate(`/counter/${selectedCounterId}${path}`);
    }
  };

  const getSelectedCounter = () => {
    return counters.find((counter) => counter.id === selectedCounterId);
  };

  // 권한이 없으면 렌더링하지 않음
  if (!currentUser || !hasValidRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader title="계수기 선택" showBackButton={true} backPath="/" showLogout={true} />

      {/* Main Content */}
      <main className="py-8">
        <PageContainer maxWidth="md" padding="md">
          <Card>
            <CardHeader>
              <div className="text-center">
                <p className="text-muted-foreground">작업할 계수기를 선택한 후 원하는 기능에 접근할 수 있습니다</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Counter Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">계수기 선택</label>
                <Select value={selectedCounterId} onValueChange={setSelectedCounterId} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoading ? "계수기 목록을 불러오는 중..." : "계수기를 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {counters.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        사용 가능한 계수기가 없습니다
                      </div>
                    ) : (
                      <SelectGroup>
                        <SelectLabel>사용 가능한 계수기</SelectLabel>
                        {counters.map((counter) => (
                          <SelectItem key={counter.id} value={counter.id}>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{counter.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Counter Info */}
              {selectedCounterId && (
                <Card>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Settings className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">선택된 계수기: {getSelectedCounter()?.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {selectedCounterId}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-foreground mb-3">사용 가능한 기능</div>

                <div className="grid gap-3">
                  {/* Administrator can access all features */}
                  {isAdministrator && (
                    <>
                      <Button
                        onClick={() => handleNavigation("/controller")}
                        disabled={!selectedCounterId}
                        className="w-full h-14 flex items-center justify-start space-x-4 text-left"
                        variant="outline"
                      >
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Play className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">컨트롤러</div>
                          <div className="text-sm text-muted-foreground">경기 진행 및 제어 기능</div>
                        </div>
                      </Button>

                      <Button
                        onClick={() => handleNavigation("/timer")}
                        disabled={!selectedCounterId}
                        className="w-full h-14 flex items-center justify-start space-x-4 text-left"
                        variant="outline"
                      >
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">타이머</div>
                          <div className="text-sm text-muted-foreground">타이머 표시 화면</div>
                        </div>
                      </Button>
                    </>
                  )}

                  {/* Manual recorder can only access manual counter */}
                  {(isAdministrator || isManualRecorder) && (
                    <Button
                      onClick={() => handleNavigation("/manual-counter")}
                      disabled={!selectedCounterId}
                      className="w-full h-14 flex items-center justify-start space-x-4 text-left"
                      variant="outline"
                    >
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Timer className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium">수동 계수</div>
                        <div className="text-sm text-muted-foreground">수동으로 기록 입력</div>
                      </div>
                    </Button>
                  )}

                  {/* If no features available for current role */}
                  {!isAdministrator && !isManualRecorder && (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">현재 권한으로는 사용할 수 있는 기능이 없습니다.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          관리자에게 문의하여 적절한 권한을 부여받으세요.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Help Text */}
              <Card>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">사용 가능한 기능:</p>
                    <ul className="space-y-1">
                      {isAdministrator && (
                        <>
                          <li>• 컨트롤러: 경기 진행 및 제어</li>
                          <li>• 타이머: 경기 시간 표시</li>
                          <li>• 수동 계수: 수동 기록 입력</li>
                        </>
                      )}
                      {isManualRecorder && !isAdministrator && <li>• 수동 계수: 수동 기록 입력</li>}
                      {!isAdministrator && !isManualRecorder && <li>• 사용 가능한 기능이 없습니다</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </PageContainer>
      </main>
    </div>
  );
}
