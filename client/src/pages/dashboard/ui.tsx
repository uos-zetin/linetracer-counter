import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useCompetitionService } from "@/features/competition";
import { useDivisionService } from "@/features/division";
import { useParticipantService } from "@/features/participant";
import { useRecordService } from "@/features/record";

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const competitionId = searchParams.get("competitionId");
  const divisionId = searchParams.get("divisionId");

  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const participantService = useParticipantService();
  const recordService = useRecordService();

  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(competitionId || "");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(divisionId || "");

  const competitions = competitionService.useCompetitions();
  const divisions = divisionService.useDivisionsByCompetition(competitionId || "");
  const participants = participantService.useAllParticipants();
  const topRecords = recordService.useTopRecordsByDivision(selectedDivisionId || "");

  // 대회 목록 로드
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        await competitionService.loadAllCompetitions();
      } catch (error) {
        console.error("Failed to load competitions:", error);
      }
    };

    loadCompetitions();
  }, [competitionService]);

  // 대회 선택 시 부문 목록 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      const loadDivisions = async () => {
        try {
          await divisionService.loadDivisionsByCompetition(selectedCompetitionId);
        } catch (error) {
          console.error("Failed to load divisions:", error);
        }
      };

      loadDivisions();
    }
  }, [selectedCompetitionId, divisionService]);

  // 부문 로드 완료 후 참가자 로드
  useEffect(() => {
    if (selectedCompetitionId && divisions.length > 0) {
      const loadParticipants = async () => {
        try {
          const divisionIds = divisions.map((d) => d.id);
          await participantService.loadParticipantsByDivisions(divisionIds);
        } catch (error) {
          console.error("Failed to load participants:", error);
        }
      };

      loadParticipants();
    }
  }, [selectedCompetitionId, divisions.length, participantService]); // eslint-disable-line react-hooks/exhaustive-deps

  // 부문별 top record 로드 (특정 부문 선택 시 또는 모든 부문)
  useEffect(() => {
    if (selectedDivisionId) {
      // 특정 부문의 top record 로드
      const loadTopRecords = async () => {
        try {
          await recordService.loadTopRecordsByDivision(selectedDivisionId);
        } catch (error) {
          console.error("Failed to load top records:", error);
        }
      };
      loadTopRecords();
    } else if (selectedCompetitionId && divisions.length > 0) {
      // 모든 부문의 top record 로드
      const loadAllTopRecords = async () => {
        try {
          await Promise.all(divisions.map((division) => recordService.loadTopRecordsByDivision(division.id)));
        } catch (error) {
          console.error("Failed to load all top records:", error);
        }
      };
      loadAllTopRecords();
    }
  }, [selectedDivisionId, selectedCompetitionId, divisions.length, recordService]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL에서 competitionId가 변경되면 상태 업데이트
  useEffect(() => {
    setSelectedCompetitionId(competitionId || "");
  }, [competitionId]);

  // URL에서 divisionId가 변경되면 상태 업데이트
  useEffect(() => {
    setSelectedDivisionId(divisionId || "");
  }, [divisionId]);

  // 대회 선택 핸들러
  const handleCompetitionChange = (newCompetitionId: string) => {
    setSelectedCompetitionId(newCompetitionId);
    setSelectedDivisionId(""); // 대회 변경 시 부문 선택 초기화

    if (newCompetitionId) {
      setSearchParams({ competitionId: newCompetitionId });
    } else {
      setSearchParams({});
    }
  };

  // 부문 선택 핸들러
  const handleDivisionChange = (newDivisionId: string) => {
    setSelectedDivisionId(newDivisionId);

    if (selectedCompetitionId) {
      if (newDivisionId) {
        setSearchParams({ competitionId: selectedCompetitionId, divisionId: newDivisionId });
      } else {
        setSearchParams({ competitionId: selectedCompetitionId });
      }
    }
  };

  const selectedCompetition = competitions.find((c) => c.id === selectedCompetitionId);

  // 참가자 ID로 이름 찾기
  const getParticipantName = (participantId: string): string => {
    const participant = participants.find((p) => p.id === participantId);
    return participant?.name || `Unknown Participant`;
  };

  // 각 참가자별 최고 기록 계산
  const getTopRecordsByParticipant = (divisionRecords: typeof topRecords) => {
    const recordsByParticipant = new Map<string, (typeof topRecords)[0]>();

    divisionRecords.forEach((record) => {
      const existing = recordsByParticipant.get(record.participantId);
      if (!existing || record.value < existing.value) {
        // 더 좋은 기록 (시간이 짧을수록 좋음)
        recordsByParticipant.set(record.participantId, record);
      }
    });

    return Array.from(recordsByParticipant.values()).sort((a, b) => a.value - b.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">대시보드</h1>

        {/* 대회 선택 드롭다운 */}
        <div className="mb-6">
          <label htmlFor="competition-select" className="block text-sm font-medium text-gray-700 mb-2">
            대회 선택
          </label>
          <select
            id="competition-select"
            value={selectedCompetitionId}
            onChange={(e) => handleCompetitionChange(e.target.value)}
            className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- 대회를 선택하세요 --</option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
        </div>

        {/* 선택된 대회가 있을 때만 부문 선택 및 기록 표시 */}
        {selectedCompetitionId && selectedCompetition && (
          <>
            {/* 부문 선택 드롭다운 */}
            <div className="mb-6">
              <label htmlFor="division-select" className="block text-sm font-medium text-gray-700 mb-2">
                부문 선택 (선택사항)
              </label>
              <select
                id="division-select"
                value={selectedDivisionId}
                onChange={(e) => handleDivisionChange(e.target.value)}
                className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- 모든 부문 --</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 대회 정보 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedCompetition.name}</h2>
              <p className="text-gray-600">{selectedCompetition.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                <p>생성일: {new Date(selectedCompetition.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Top Records 표시 영역 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDivisionId ? "부문별 최고 기록" : "전체 부문 최고 기록"}
              </h3>

              {selectedDivisionId ? (
                // 특정 부문이 선택된 경우
                (() => {
                  const divisionTopRecords = getTopRecordsByParticipant(topRecords);
                  return divisionTopRecords.length > 0 ? (
                    <div className="space-y-3">
                      {divisionTopRecords.map((record, index) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-amber-600"
                                      : "bg-gray-300"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{getParticipantName(record.participantId)}</p>
                              <p className="text-sm text-gray-500">
                                {record.source} • {new Date(record.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{record.value}ms</p>
                            <p
                              className={`text-sm ${
                                record.status === "approved"
                                  ? "text-green-600"
                                  : record.status === "rejected"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                              }`}
                            >
                              {record.status === "approved"
                                ? "승인됨"
                                : record.status === "rejected"
                                  ? "거부됨"
                                  : "대기중"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>해당 부문에 기록이 없습니다.</p>
                      <p className="text-sm mt-2">
                        선택된 부문: {divisions.find((d) => d.id === selectedDivisionId)?.name}
                      </p>
                    </div>
                  );
                })()
              ) : (
                // 모든 부문별 top record 표시
                <div className="space-y-8">
                  {divisions
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((division) => {
                      const divisionRecords = topRecords.filter(
                        (record) => participants.find((p) => p.id === record.participantId)?.divisionId === division.id
                      );
                      const divisionTopRecords = getTopRecordsByParticipant(divisionRecords);

                      return (
                        <div key={division.id} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="text-lg font-semibold text-gray-900 mb-3">{division.name}</h4>
                          {divisionTopRecords.length > 0 ? (
                            <div className="space-y-2">
                              {divisionTopRecords.map((record, index) => (
                                <div
                                  key={record.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                >
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                        index === 0
                                          ? "bg-yellow-500"
                                          : index === 1
                                            ? "bg-gray-400"
                                            : index === 2
                                              ? "bg-amber-600"
                                              : "bg-gray-300"
                                      }`}
                                    >
                                      {index + 1}
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {getParticipantName(record.participantId)}
                                      </p>
                                      <p className="text-xs text-gray-500">{record.source}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900">{record.value}ms</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">기록이 없습니다.</p>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </>
        )}

        {/* 대회가 선택되지 않았을 때 */}
        {!selectedCompetitionId && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">대회를 선택하여 기록을 확인하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};
