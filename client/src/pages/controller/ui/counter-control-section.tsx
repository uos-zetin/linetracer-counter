import { useState, useEffect } from "react";
import type { Competition } from "@/entities/competition";
import { useAdminDivisionService } from "@/features/admin-division";
import { useCompetitionService } from "@/features/competition";
import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";

interface CounterControlSectionProps {
  counterId: string;
}

export const CounterControlSection = ({ counterId }: CounterControlSectionProps) => {
  const counterService = useCounterService();
  const competitionService = useCompetitionService();
  const divisionService = useAdminDivisionService();
  const progressService = useProgressService();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  const counter = counterService?.useCounterState(counterId) || null;
  const isConnected = !!counter;
  const competitions = competitionService?.use.competitions() || [];
  const divisions = divisionService?.useDivisionsByCompetition(selectedCompetitionId);
  const division = divisionService?.useDivisionById(counter?.divisionId || "");

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (competitionService) {
        try {
          await competitionService.load.all();
        } catch (error) {
          console.error("Failed to load competitions:", error);
        }
      }
    };
    loadData();
  }, [competitionService]);

  // Division 관련 데이터 로딩
  useEffect(() => {
    const loadDivisions = async () => {
      if (selectedCompetitionId && divisionService) {
        try {
          await divisionService.loadDivisionsByCompetition(selectedCompetitionId);
        } catch (error) {
          console.error("Failed to load divisions:", error);
        }
      }
    };
    loadDivisions();
  }, [selectedCompetitionId, divisionService]);

  // Counter에 divisionId가 있을 때 division 데이터 로딩
  useEffect(() => {
    const loadDivisionData = async () => {
      if (counter?.divisionId && !division && divisionService) {
        try {
          await divisionService.loadDivisionById(counter.divisionId);
        } catch (error) {
          console.error("Failed to load division:", error);
        }
      }
    };
    loadDivisionData();
  }, [counter?.divisionId, division, divisionService]);

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
      await counterService.connectDivision(counterId, selectedDivisionId);
      await divisionService.loadDivisionById(selectedDivisionId);
    } catch (error) {
      console.error("Division 연결 실패:", error);
    }
  };

  const handleDisconnectDivision = async () => {
    if (!counterService) return;

    if (confirm("Division 연결을 해제하시겠습니까?")) {
      try {
        await counterService.disconnectDivision(counterId);
        setSelectedCompetitionId("");
        setSelectedDivisionId("");
      } catch (error) {
        console.error("Division 연결 해제 실패:", error);
      }
    }
  };

  const handleDivisionStatusChange = async (action: "start" | "stop" | "reset") => {
    if (!progressService || !counter?.divisionId) return;

    const actionMessages = {
      start: "부문을 시작하시겠습니까?",
      stop: "부문을 종료하시겠습니까?",
      reset: "부문을 초기화하시겠습니까?",
    };

    if (confirm(actionMessages[action])) {
      try {
        switch (action) {
          case "start":
            await progressService.openDivision(counter.divisionId);
            break;
          case "stop":
            await progressService.closeDivision(counter.divisionId);
            break;
          case "reset":
            await progressService.resetDivision(counter.divisionId);
            break;
        }
        await divisionService.loadDivisionById(counter.divisionId);
      } catch (error) {
        console.error(`Division ${action} 실패:`, error);
      }
    }
  };

  const getDivisionStatusBadge = (status?: string) => {
    const statusConfig = {
      ready: { bg: "bg-blue-100", text: "text-blue-800", label: "Ready" },
      ongoing: { bg: "bg-green-100", text: "text-green-800", label: "Ongoing" },
      closed: { bg: "bg-gray-100", text: "text-gray-800", label: "Closed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;

    return <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>{config.label}</span>;
  };

  const canStart = division?.status === "ready";
  const canStop = division?.status === "ongoing";
  const canReset = division?.status === "closed";

  if (!counterService) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">카운터 제어</h2>
        <p className="text-red-500">카운터 서비스를 사용할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">카운터 제어</h2>

      <div className="space-y-4">
        {/* 연결 상태 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">연결 상태</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isConnected ? "연결됨" : "연결 안됨"}
          </span>
        </div>

        {/* 카운터 정보 */}
        {counter && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">카운터 정보</h3>
            <p className="text-sm text-gray-900">ID: {counter.id}</p>
            <p className="text-sm text-gray-900">이름: {counter.name || "이름 없음"}</p>
          </div>
        )}

        {/* Division 연결 */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Division 연결</h3>

          {counter?.divisionId ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-900">{division?.name || `Division ${counter.divisionId}`}</span>
                {getDivisionStatusBadge(division?.status)}
              </div>
              <button
                onClick={handleDisconnectDivision}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Division 연결 해제
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedCompetitionId}
                onChange={(e) => {
                  setSelectedCompetitionId(e.target.value);
                  setSelectedDivisionId("");
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Competition 선택</option>
                {competitions.map((comp: Competition) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name}
                  </option>
                ))}
              </select>

              {selectedCompetitionId && (
                <select
                  value={selectedDivisionId}
                  onChange={(e) => setSelectedDivisionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Division 선택</option>
                  {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleConnectDivision}
                disabled={!selectedDivisionId}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Division 연결
              </button>
            </div>
          )}
        </div>

        {/* Division 상태 제어 */}
        {counter?.divisionId && division && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Division 상태 제어</h3>
            <div className="space-y-2">
              {canStart && (
                <button
                  onClick={() => handleDivisionStatusChange("start")}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                >
                  부문 시작 (Ready → Ongoing)
                </button>
              )}

              {canStop && (
                <button
                  onClick={() => handleDivisionStatusChange("stop")}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                >
                  부문 종료 (Ongoing → Closed)
                </button>
              )}

              {canReset && (
                <button
                  onClick={() => handleDivisionStatusChange("reset")}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-md text-sm transition-colors"
                >
                  부문 초기화 (Closed → Ready)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
