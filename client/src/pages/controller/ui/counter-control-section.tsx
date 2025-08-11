import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Settings, Info, Link, Wifi, Play } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui";
import type { Competition } from "@/entities/competition";
import { useCompetitionService } from "@/features/competition";
import { useCounterService } from "@/features/counter";
import { useDivisionService } from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";
import { useProgressService } from "@/features/progress";

interface CounterControlSectionProps {
  counterId: string;
}

export const CounterControlSection = ({ counterId }: CounterControlSectionProps) => {
  const counterService = useCounterService();
  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const progressService = useProgressService();
  const errorHandler = useErrorHandlingService();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: "disconnect" | "start" | "stop" | "reset";
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "disconnect",
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const counter = counterService?.use.counterState(counterId) || null;
  const isConnected = !!counter;
  const competitions = competitionService?.use.competitions() || [];
  const divisions = divisionService?.use.divisionsByCompetition(selectedCompetitionId);
  const division = divisionService?.use.divisionById(counter?.divisionId || "");

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (competitionService) {
        try {
          await competitionService.load.all();
        } catch (error) {
          errorHandler.handle(error as Error, "대회 목록을 불러오는데 실패했습니다");
        }
      }
    };
    loadData();
  }, [competitionService, errorHandler]);

  // Division 관련 데이터 로딩
  useEffect(() => {
    const loadDivisions = async () => {
      if (selectedCompetitionId && divisionService) {
        try {
          await divisionService.load.byCompetition(selectedCompetitionId);
        } catch (error) {
          errorHandler.handle(error as Error, "부문 목록을 불러오는데 실패했습니다");
        }
      }
    };
    loadDivisions();
  }, [selectedCompetitionId, divisionService, errorHandler]);

  // Counter에 divisionId가 있을 때 division 데이터 로딩
  useEffect(() => {
    const loadDivisionData = async () => {
      if (counter?.divisionId && !division && divisionService) {
        try {
          await divisionService.load.byId(counter.divisionId);
        } catch (error) {
          errorHandler.handle(error as Error, "부문 정보를 불러오는데 실패했습니다");
        }
      }
    };
    loadDivisionData();
  }, [counter?.divisionId, division, divisionService, errorHandler]);

  // Counter의 division 정보가 있을 때 선택 상태 설정
  useEffect(() => {
    if (counter?.divisionId && division?.competitionId) {
      setSelectedCompetitionId(division.competitionId);
      setSelectedDivisionId(counter.divisionId);
    }
  }, [counter?.divisionId, division]);

  const handleConnectDivision = async () => {
    if (!counterService || !selectedDivisionId) return;

    try {
      await counterService.admin.connectDivision(counterId, selectedDivisionId);
      await divisionService.load.byId(selectedDivisionId);
    } catch (error) {
      errorHandler.handle(error as Error, "부문 연결에 실패했습니다");
    }
  };

  const handleDisconnectDivision = () => {
    if (!counterService) return;

    setDialogState({
      isOpen: true,
      type: "disconnect",
      title: "부문 연결 해제",
      description: "부문 연결을 해제하시겠습니까?",
      onConfirm: async () => {
        try {
          await counterService.admin.disconnectDivision(counterId);
          setSelectedCompetitionId("");
          setSelectedDivisionId("");
          setDialogState(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          errorHandler.handle(error as Error, "부문 연결 해제에 실패했습니다");
        }
      },
    });
  };

  const handleDivisionStatusChange = (action: "start" | "stop" | "reset") => {
    if (!progressService || !counter?.divisionId) return;

    const actionConfig = {
      start: {
        title: "부문 시작",
        description: "부문을 시작하시겠습니까?",
        errorMessage: "부문 시작에 실패했습니다",
        apiCall: () => progressService.admin.openDivision(counter.divisionId!),
      },
      stop: {
        title: "부문 종료",
        description: "부문을 종료하시겠습니까?",
        errorMessage: "부문 종료에 실패했습니다",
        apiCall: () => progressService.admin.closeDivision(counter.divisionId!),
      },
      reset: {
        title: "부문 초기화",
        description: "부문을 초기화하시겠습니까?",
        errorMessage: "부문 초기화에 실패했습니다",
        apiCall: () => progressService.admin.resetDivision(counter.divisionId!),
      },
    };

    const config = actionConfig[action];
    
    setDialogState({
      isOpen: true,
      type: action,
      title: config.title,
      description: config.description,
      onConfirm: async () => {
        try {
          await config.apiCall();
          await divisionService.load.byId(counter.divisionId!);
          setDialogState(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          errorHandler.handle(error as Error, config.errorMessage);
        }
      },
    });
  };

  const getDivisionStatusBadge = (status?: string) => {
    const statusConfig = {
      ready: { variant: "secondary" as const, label: "Ready" },
      ongoing: { variant: "default" as const, label: "Ongoing" },
      closed: { variant: "outline" as const, label: "Closed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canStart = division?.status === "ready";
  const canStop = division?.status === "ongoing";
  const canReset = division?.status === "closed";

  if (!counterService) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>계수기 제어</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p>계수기 서비스를 사용할 수 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>계수기 제어</span>
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* 연결 상태 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground flex items-center space-x-2">
            <Wifi className="h-4 w-4" />
            <span>연결 상태</span>
          </span>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge variant="default">연결됨</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <Badge variant="destructive">연결 안됨</Badge>
              </>
            )}
          </div>
        </div>

        {/* 계수기 정보 */}
        {counter && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>계수기 정보</span>
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">ID: <span className="text-foreground">{counter.id}</span></p>
              <p className="text-sm text-muted-foreground">이름: <span className="text-foreground">{counter.name || "이름 없음"}</span></p>
              {counter.divisionId && (
                <>
                  <p className="text-sm text-muted-foreground">부문 ID: <span className="text-foreground">{counter.divisionId}</span></p>
                  {division && (
                    <p className="text-sm text-muted-foreground">부문명: <span className="text-foreground">{division.name}</span></p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Division 연결 */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>부문 연결</span>
          </h3>

          {counter?.divisionId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{division?.name || `부문 ${counter.divisionId}`}</span>
                {getDivisionStatusBadge(division?.status)}
              </div>
              <Button
                onClick={handleDisconnectDivision}
                variant="destructive"
                className="w-full"
              >
                부문 연결 해제
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={selectedCompetitionId}
                onValueChange={(value) => {
                  setSelectedCompetitionId(value);
                  setSelectedDivisionId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="대회 선택" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((comp: Competition) => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCompetitionId && (
                <Select
                  value={selectedDivisionId}
                  onValueChange={setSelectedDivisionId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="부문 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={handleConnectDivision}
                disabled={!selectedDivisionId}
                className="w-full"
              >
                부문 연결
              </Button>
            </div>
          )}
        </div>

        {/* Division 상태 제어 */}
        {counter?.divisionId && division && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>부문 상태 제어</span>
            </h3>
            <div className="space-y-2">
              {canStart && (
                <Button
                  onClick={() => handleDivisionStatusChange("start")}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  부문 시작 (Ready → Ongoing)
                </Button>
              )}

              {canStop && (
                <Button
                  onClick={() => handleDivisionStatusChange("stop")}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  부문 종료 (Ongoing → Closed)
                </Button>
              )}

              {canReset && (
                <Button
                  onClick={() => handleDivisionStatusChange("reset")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  부문 초기화 (Closed → Ready)
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* AlertDialog */}
    <AlertDialog open={dialogState.isOpen} onOpenChange={(open) => setDialogState(prev => ({ ...prev, isOpen: open }))}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogState.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogState.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={dialogState.onConfirm}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
