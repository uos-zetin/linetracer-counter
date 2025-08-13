import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Users, Edit, Trash2, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
  Badge,
} from "@/shared/ui";
import type { Competition } from "@/entities/competition";
import type { Participant, ParticipantForm } from "@/entities/participant";
import { useCompetitionService } from "@/features/competition";
import { useDivisionService } from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";
import {
  useParticipantService,
  AdminParticipantCreateModal,
  AdminParticipantEditModal,
  AdminParticipantDeleteModal,
} from "@/features/participant";

// 페이지네이션 설정
const PARTICIPANTS_PER_PAGE = 5;

export function ParticipantManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const participantService = useParticipantService();
  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();

  const competitions = competitionService.use.competitions();
  const selectedCompetitionId = searchParams.get("competitionId") || "";
  const divisions = divisionService.use.divisionsByCompetition(selectedCompetitionId);
  const allParticipants = participantService.use.allParticipants();
  const errorHandler = useErrorHandlingService();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.load.all().catch((error: unknown) => {
      errorHandler.handle(error as Error, "대회 목록 로드 중 오류가 발생했습니다");
    });
  }, [competitionService, errorHandler]);

  // 선택된 대회의 부문들 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      divisionService.load.byCompetition(selectedCompetitionId).catch((error: unknown) => {
        errorHandler.handle(error as Error, "부문 목록 로드 중 오류가 발생했습니다");
      });
    }
  }, [divisionService, selectedCompetitionId, errorHandler]);

  // 모든 부문의 참가자들을 한 번에 로드 - divisions가 로드된 후 실행
  useEffect(() => {
    const divisionIds = divisions.map((division) => division.id);
    participantService.load.byDivisions(divisionIds).catch((error: unknown) => {
      errorHandler.handle(error as Error, "참가자 목록 로드 중 오류가 발생했습니다");
    });
  }, [participantService, divisions, errorHandler]);

  // 대회 이름 찾기 헬퍼 함수
  const getCompetitionName = (competitionId: string): string => {
    const competition = competitions.find((c: Competition) => c.id === competitionId);
    return competition?.name || "알 수 없는 대회";
  };

  // 부문별 참가자 그룹화
  const getParticipantsByDivision = (divisionId: string): Participant[] => {
    return allParticipants
      .filter((p: Participant) => p.divisionId === divisionId)
      .sort((a: Participant, b: Participant) => a.orderRaw - b.orderRaw);
  };

  // 페이지네이션 헬퍼 함수
  const getPaginatedParticipants = (divisionId: string): Participant[] => {
    const divisionParticipants = getParticipantsByDivision(divisionId);
    const page = currentPage[divisionId] || 1;
    const startIndex = (page - 1) * PARTICIPANTS_PER_PAGE;
    const endIndex = startIndex + PARTICIPANTS_PER_PAGE;
    return divisionParticipants.slice(startIndex, endIndex);
  };

  const getTotalPages = (divisionId: string): number => {
    const divisionParticipants = getParticipantsByDivision(divisionId);
    return Math.ceil(divisionParticipants.length / PARTICIPANTS_PER_PAGE);
  };

  const getCurrentPage = (divisionId: string): number => {
    return currentPage[divisionId] || 1;
  };

  const setDivisionPage = (divisionId: string, page: number) => {
    setCurrentPage((prev) => ({ ...prev, [divisionId]: page }));
  };

  // 대회 선택 핸들러
  const handleCompetitionSelect = (competitionId: string) => {
    if (competitionId) {
      setSearchParams({ competitionId });
    } else {
      setSearchParams({});
    }
    setCurrentPage({}); // 페이지 초기화
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsEditModalOpen(true);
  };

  const handleDelete = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (data: ParticipantForm) => {
    try {
      await participantService.admin.create(data.divisionId, data);
      setIsCreateModalOpen(false);
    } catch (error) {
      errorHandler.handle(error as Error, "참가자 생성 중 오류가 발생했습니다");
    }
  };

  const handleEditSubmit = async (data: ParticipantForm) => {
    if (!selectedParticipant) return;

    try {
      await participantService.admin.update(selectedParticipant.id, data);
      setIsEditModalOpen(false);
      setSelectedParticipant(null);
    } catch (error) {
      errorHandler.handle(error as Error, "참가자 수정 중 오류가 발생했습니다");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedParticipant) return;

    try {
      await participantService.admin.delete(selectedParticipant.id);

      setIsDeleteModalOpen(false);
      setSelectedParticipant(null);
    } catch (error) {
      errorHandler.handle(error as Error, "참가자 삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">참가자 관리</h1>
            <p className="mt-2 text-muted-foreground">참가자를 생성, 수정, 삭제할 수 있습니다</p>
          </div>
          <Button onClick={handleCreate} disabled={!selectedCompetitionId} className="self-start sm:self-auto">
            <UserPlus className="w-4 h-4" />
            참가자 추가
          </Button>
        </div>

        {/* 대회 선택 드롭다운 */}
        <Card>
          <CardContent className="px-6">
            <div className="space-y-2">
              <span className="block text-sm font-medium text-foreground">대회 선택</span>
              <Select value={selectedCompetitionId} onValueChange={handleCompetitionSelect}>
                <SelectTrigger className="w-full max-w-md">
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
            {selectedCompetitionId && (
              <p className="mt-2 text-sm text-primary">선택된 대회: {getCompetitionName(selectedCompetitionId)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 참가자 목록 (부문별) */}
      <div className="space-y-6">
        {!selectedCompetitionId ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">대회를 선택해주세요</h3>
              <p className="text-muted-foreground">먼저 대회를 선택한 후 참가자를 관리할 수 있습니다.</p>
            </CardContent>
          </Card>
        ) : divisions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">부문이 없습니다</h3>
              <p className="text-muted-foreground">선택된 대회에 아직 부문이 없습니다. 먼저 부문을 생성해주세요.</p>
            </CardContent>
          </Card>
        ) : (
          divisions.map((division) => {
            const divisionParticipants = getParticipantsByDivision(division.id);
            const paginatedParticipants = getPaginatedParticipants(division.id);
            const totalPages = getTotalPages(division.id);
            const currentPageNum = getCurrentPage(division.id);

            return (
              <Card key={division.id}>
                {/* 부문 헤더 */}
                <div className="px-6 border-b border-border">
                  <div className="flex pb-4 justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{division.name}</h3>
                      <p className="text-sm text-muted-foreground">{division.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      총 {divisionParticipants.length}명
                    </Badge>
                  </div>
                </div>

                {/* 참가자 목록 */}
                <div className="px-6">
                  {divisionParticipants.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">이 부문에 참가자가 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {/* 참가자 카드들 */}
                      <div className="space-y-3">
                        {paginatedParticipants.map((participant) => (
                          <Card key={participant.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="px-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <Badge
                                      variant="default"
                                      className="w-8 h-8 rounded-full flex items-center justify-center p-0 text-sm font-medium"
                                    >
                                      {participant.orderRaw}
                                    </Badge>
                                    <h4 className="text-lg font-semibold text-foreground">{participant.name}</h4>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                    <div>
                                      <span className="font-medium text-foreground">팀명:</span> {participant.teamName}
                                    </div>
                                    <div>
                                      <span className="font-medium text-foreground">로봇명:</span>{" "}
                                      {participant.robotName}
                                    </div>
                                  </div>
                                  {participant.comment && (
                                    <p className="mt-2 text-sm text-muted-foreground">{participant.comment}</p>
                                  )}
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    등록일: {formatDate(participant.createdAt)}
                                  </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(participant)}
                                    className="h-9 w-9 p-0"
                                    title="수정"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(participant)}
                                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                                    title="삭제"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* 페이지네이션 */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDivisionPage(division.id, Math.max(1, currentPageNum - 1))}
                            disabled={currentPageNum === 1}
                            className="flex items-center"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            이전
                          </Button>
                          <span className="text-sm text-foreground">
                            {currentPageNum} / {totalPages} 페이지
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDivisionPage(division.id, Math.min(totalPages, currentPageNum + 1))}
                            disabled={currentPageNum === totalPages}
                            className="flex items-center"
                          >
                            다음
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 모달들 */}
      <AdminParticipantCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        divisions={divisions}
      />

      <AdminParticipantEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParticipant(null);
        }}
        onSubmit={handleEditSubmit}
        participant={selectedParticipant}
        divisions={divisions}
      />

      <AdminParticipantDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedParticipant(null);
        }}
        onConfirm={handleDeleteConfirm}
        participant={selectedParticipant}
      />
    </div>
  );
}
