import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { formatDate } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  Badge,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  BarChart3,
  Clock,
  TrendingUp,
  AlertCircle,
} from "@/shared/ui";
import type { Competition } from "@/entities/competition";
import { formatElapsedMs } from "@/entities/counter";
import type { Division } from "@/entities/division";
import type { Participant } from "@/entities/participant";
import type { Record, RecordStatus } from "@/entities/record";
import { useCompetitionService } from "@/features/competition";
import { useDivisionService } from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";
import { useParticipantService } from "@/features/participant";
import { useRecordService, RecordNoteEditor, RecordStatusSelector } from "@/features/record";

export function RecordManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const participantService = useParticipantService();
  const recordService = useRecordService();
  const errorHandler = useErrorHandlingService();

  const competitions = competitionService.use.competitions();
  const selectedCompetitionId = searchParams.get("competitionId") || "";
  const selectedDivisionId = searchParams.get("divisionId") || "";
  const selectedStatus = (searchParams.get("status") as RecordStatus) || "";

  const divisions = divisionService.use.divisionsByCompetition(selectedCompetitionId);
  const allParticipants = participantService.use.allParticipants();
  const allRecords = recordService.use.records();

  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.load.all().catch((error: unknown) => {
      errorHandler.handle(error as Error, "대회 목록 로드 중 오류가 발생했습니다");
    });
  }, [competitionService, errorHandler]);

  // 선택된 대회의 부문들 로드
  useEffect(() => {
    if (!selectedCompetitionId) return;
    divisionService.load.byCompetition(selectedCompetitionId).catch((error: unknown) => {
      errorHandler.handle(error as Error, "부문 목록 로드 중 오류가 발생했습니다");
    });
  }, [divisionService, selectedCompetitionId, errorHandler]);

  // 선택된 부문의 참가자들 로드
  useEffect(() => {
    if (!selectedDivisionId) return;
    participantService.load.byDivisions([selectedDivisionId]).catch((error: unknown) => {
      errorHandler.handle(error as Error, "참가자 목록 로드 중 오류가 발생했습니다");
    });
  }, [participantService, divisions, selectedDivisionId, errorHandler]);

  // 선택된 참가자들의 기록들 로드
  useEffect(() => {
    const loadRecords = async () => {
      try {
        // 모든 참가자의 기록을 로드
        await Promise.all(allParticipants.map((participant) => recordService.load.byParticipant(participant.id)));
      } catch (error) {
        errorHandler.handle(error as Error, "기록 로드 중 오류가 발생했습니다");
      }
    };

    if (!selectedDivisionId) {
      recordService.load.allRecords();
      return;
    }
    loadRecords();
  }, [recordService, allParticipants, errorHandler, selectedDivisionId]);

  // 부문 이름 찾기 헬퍼 함수
  const getDivisionName = (divisionId: string): string => {
    const division = divisions.find((d: Division) => d.id === divisionId);
    return division?.name || "알 수 없는 부문";
  };

  // 참가자별로 그룹화된 기록들
  const getGroupedRecords = (): { [key: string]: { participant: Participant; records: Record[] } } => {
    let filteredRecords = [...allRecords];

    if (selectedDivisionId && selectedDivisionId !== "all") {
      // 선택된 부문의 참가자들의 기록만 필터링
      const participantIds = new Set(
        allParticipants.filter((p) => p.divisionId === selectedDivisionId).map((p) => p.id)
      );
      filteredRecords = filteredRecords.filter((record) => participantIds.has(record.participantId));
    }

    if (selectedStatus) {
      filteredRecords = filteredRecords.filter((record) => record.status === selectedStatus);
    }

    // 참가자별로 기록 그룹화
    const grouped: { [key: string]: { participant: Participant; records: Record[] } } = {};

    filteredRecords.forEach((record) => {
      const participant = allParticipants.find((p) => p.id === record.participantId);
      if (participant) {
        if (!grouped[record.participantId]) {
          grouped[record.participantId] = {
            participant,
            records: [],
          };
        }
        grouped[record.participantId].records.push(record);
      }
    });

    // 각 참가자의 기록을 시간 순으로 정렬 (최신순)
    Object.values(grouped).forEach((group: { participant: Participant; records: Record[] }) => {
      group.records.sort((a: Record, b: Record) => b.createdAt.getTime() - a.createdAt.getTime());
    });

    return grouped;
  };

  // 통계 계산
  const getRecordStats = () => {
    const groupedRecords = getGroupedRecords();
    const allFilteredRecords = Object.values(groupedRecords).flatMap(
      (group: { participant: Participant; records: Record[] }) => group.records
    );
    const pendingCount = allFilteredRecords.filter((r) => r.status === "pending").length;
    const approvedCount = allFilteredRecords.filter((r) => r.status === "approved").length;
    const rejectedCount = allFilteredRecords.filter((r) => r.status === "rejected").length;

    return { total: allFilteredRecords.length, pendingCount, approvedCount, rejectedCount };
  };

  // 필터 변경 핸들러들
  const handleCompetitionSelect = (competitionId: string) => {
    const newParams = new URLSearchParams();
    if (competitionId) {
      newParams.set("competitionId", competitionId);
    }
    setSearchParams(newParams);
  };

  const handleDivisionSelect = (divisionId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (divisionId && divisionId !== "all") {
      newParams.set("divisionId", divisionId);
    } else {
      newParams.delete("divisionId");
    }
    setSearchParams(newParams);
  };

  const handleStatusSelect = (status: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (status && status !== "all") {
      newParams.set("status", status);
    } else {
      newParams.delete("status");
    }
    setSearchParams(newParams);
  };

  // 기록 상태 업데이트 핸들러
  const handleStatusUpdate = async (recordId: string, status: RecordStatus) => {
    try {
      await recordService.admin.updateStatus(recordId, status);
      setEditingStatus(null);
    } catch (error) {
      errorHandler.handle(error as Error, "기록 상태 업데이트 중 오류가 발생했습니다");
    }
  };

  // 기록 노트 업데이트 핸들러
  const handleNoteUpdate = async (recordId: string, note: string) => {
    try {
      await recordService.admin.updateNote(recordId, note);
      setEditingNote(null);
    } catch (error) {
      errorHandler.handle(error as Error, "기록 노트 업데이트 중 오류가 발생했습니다");
    }
  };

  const stats = getRecordStats();
  const groupedRecords = getGroupedRecords();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">기록 관리</h1>
            <p className="mt-2 text-muted-foreground">경기 기록을 보기, 승인, 거부 및 분석할 수 있습니다</p>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 대회 선택 */}
          <Card>
            <CardContent className="px-6 py-3">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-foreground">대회 선택</span>
                <Select value={selectedCompetitionId} onValueChange={handleCompetitionSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="대회를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>대회 목록</SelectLabel>
                      {competitions.map((competition: Competition) => (
                        <SelectItem key={competition.id} value={competition.id}>
                          {competition.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 부문 선택 */}
          <Card>
            <CardContent className="px-6 py-3">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-foreground">부문 선택</span>
                <Select
                  value={selectedDivisionId}
                  onValueChange={handleDivisionSelect}
                  disabled={!selectedCompetitionId}
                >
                  <SelectTrigger className="w-full">
                    <div className="truncate">
                      <SelectValue
                        placeholder={selectedCompetitionId ? "부문을 선택하세요" : "먼저 대회를 선택하세요"}
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>부문 목록</SelectLabel>
                      {divisions.map((division: Division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 상태 필터 */}
          <Card>
            <CardContent className="px-6 py-3">
              <div className="space-y-2">
                <span className="block text-sm font-medium text-foreground">상태 필터</span>
                <Select value={selectedStatus || "all"} onValueChange={handleStatusSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="상태를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>상태 목록</SelectLabel>
                      <SelectItem value="all">전체 상태</SelectItem>
                      <SelectItem value="pending">승인 대기</SelectItem>
                      <SelectItem value="approved">승인됨</SelectItem>
                      <SelectItem value="rejected">거부됨</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="px-6 py-4 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">전체 기록</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6 py-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-foreground">{stats.pendingCount}</div>
              <div className="text-sm text-muted-foreground">승인 대기</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6 py-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-foreground">{stats.approvedCount}</div>
              <div className="text-sm text-muted-foreground">승인됨</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6 py-4 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-foreground">{stats.rejectedCount}</div>
              <div className="text-sm text-muted-foreground">거부됨</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 기록 목록 */}
      <Card>
        <CardContent className="px-6 py-4">
          {!selectedCompetitionId ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">대회를 선택해주세요</h3>
              <p className="text-muted-foreground">먼저 대회를 선택한 후 기록을 관리할 수 있습니다.</p>
            </div>
          ) : Object.keys(groupedRecords).length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">기록이 없습니다</h3>
              <p className="text-muted-foreground">
                {!selectedDivisionId
                  ? `부문을 선택해주세요.`
                  : selectedDivisionId && selectedStatus
                    ? `선택된 부문과 상태에 해당하는 기록이 없습니다.`
                    : selectedDivisionId
                      ? `선택된 부문에 기록이 없습니다.`
                      : selectedStatus
                        ? `선택된 상태에 해당하는 기록이 없습니다.`
                        : `아직 기록이 없습니다.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  참가자별 기록 ({Object.keys(groupedRecords).length}명, 총 {stats.total}개 기록)
                </h3>
                {selectedDivisionId && selectedDivisionId !== "all" && (
                  <Badge variant="secondary">{getDivisionName(selectedDivisionId)}</Badge>
                )}
              </div>

              <div className="space-y-6">
                {Object.values(groupedRecords).map((group: { participant: Participant; records: Record[] }) => (
                  <div key={group.participant.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-foreground">{group.participant.name}</h4>
                        <Badge variant="outline">
                          {getDivisionName(group.participant.divisionId)} · {group.records.length}개 기록
                        </Badge>
                      </div>
                      {group.records.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          최고 기록:{" "}
                          {formatElapsedMs(Math.min(...group.records.map((r: Record) => r.value))).toString()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {group.records.map((record: Record) => (
                        <Card key={record.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="px-4 py-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="text-xl font-bold text-foreground">
                                    {formatElapsedMs(record.value).toString()}
                                  </div>
                                  <Badge
                                    variant={
                                      record.status === "approved"
                                        ? "default"
                                        : record.status === "rejected"
                                          ? "destructive"
                                          : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {record.status === "pending"
                                      ? "승인 대기"
                                      : record.status === "approved"
                                        ? "승인됨"
                                        : "거부됨"}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                  <div>
                                    <span className="font-medium text-foreground">출처:</span>{" "}
                                    {record.source === "stopwatch"
                                      ? "계수기"
                                      : record.source === "manual"
                                        ? "수동 계수"
                                        : "기타"}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">기록일:</span>{" "}
                                    {formatDate(record.createdAt)}
                                  </div>
                                </div>
                                {record.note && (
                                  <p className="mt-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                                    {record.note}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingNote(editingNote === record.id ? null : record.id);
                                    setEditingStatus(null);
                                  }}
                                  className="h-9 px-3"
                                  title="노트 수정"
                                >
                                  노트
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingStatus(editingStatus === record.id ? null : record.id);
                                    setEditingNote(null);
                                  }}
                                  className="h-9 px-3"
                                  title="상태 변경"
                                >
                                  상태
                                </Button>
                              </div>
                            </div>

                            {/* 인라인 편집 영역 */}
                            {editingNote === record.id && (
                              <div className="mt-4 pt-4 border-t">
                                <RecordNoteEditor
                                  recordId={record.id}
                                  currentNote={record.note || ""}
                                  onNoteChange={(note) => handleNoteUpdate(record.id, note)}
                                  className="w-full"
                                />
                              </div>
                            )}

                            {editingStatus === record.id && (
                              <div className="mt-4 pt-4 border-t">
                                <RecordStatusSelector
                                  recordId={record.id}
                                  currentStatus={record.status}
                                  onStatusChange={(status) => handleStatusUpdate(record.id, status)}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
