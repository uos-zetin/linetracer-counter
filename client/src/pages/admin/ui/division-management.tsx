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
  Plus,
  List,
  Edit,
  Trash2,
  Clock,
} from "@/shared/ui";
import type { Competition } from "@/entities/competition";
import type { Division, DivisionForm } from "@/entities/division";
import { useCompetitionService } from "@/features/competition";
import {
  useDivisionService,
  AdminDivisionCreateModal,
  AdminDivisionEditModal,
  AdminDivisionDeleteModal,
} from "@/features/division";
import { useErrorHandlingService } from "@/features/error-handling";

export function DivisionManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const divisionService = useDivisionService();
  const competitionService = useCompetitionService();
  const competitions = competitionService.use.competitions();
  const errorHandler = useErrorHandlingService();

  const selectedCompetitionId = searchParams.get("competitionId") || "";
  const divisions = divisionService.use.divisionsByCompetition(selectedCompetitionId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.load.all().catch((error: unknown) => {
      errorHandler.handle(error as Error, "대회 목록 로드 중 오류가 발생했습니다");
    });
  }, [divisionService, competitionService, errorHandler]);

  // 선택된 대회의 부문들 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      divisionService.load.byCompetition(selectedCompetitionId).catch((error: unknown) => {
        errorHandler.handle(error as Error, "부문 목록 로드 중 오류가 발생했습니다");
      });
    }
  }, [divisionService, selectedCompetitionId, errorHandler]);

  // 대회 이름 찾기 헬퍼 함수
  const getCompetitionName = (competitionId: string): string => {
    const competition = competitions.find((c: Competition) => c.id === competitionId);
    return competition?.name || "알 수 없는 대회";
  };

  // 상태별 배지 variants
  const getStatusVariant = (status: Division["status"]) => {
    switch (status) {
      case "ready":
        return { text: "준비", variant: "secondary" as const };
      case "ongoing":
        return { text: "진행중", variant: "default" as const };
      case "closed":
        return { text: "종료", variant: "destructive" as const };
      default:
        return { text: "알 수 없음", variant: "outline" as const };
    }
  };

  // 대회 선택 핸들러
  const handleCompetitionSelect = (competitionId: string) => {
    if (competitionId) {
      setSearchParams({ competitionId });
    } else {
      setSearchParams({});
    }
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (division: Division) => {
    setSelectedDivision(division);
    setIsEditModalOpen(true);
  };

  const handleDelete = (division: Division) => {
    setSelectedDivision(division);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (data: DivisionForm) => {
    try {
      await divisionService.admin.create(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      errorHandler.handle(error as Error, "부문 생성 중 오류가 발생했습니다");
    }
  };

  const handleEditSubmit = async (data: DivisionForm) => {
    if (!selectedDivision) return;

    try {
      await divisionService.admin.update(selectedDivision.id, data);
      setIsEditModalOpen(false);
      setSelectedDivision(null);
    } catch (error) {
      errorHandler.handle(error as Error, "부문 수정 중 오류가 발생했습니다");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDivision) return;

    try {
      await divisionService.admin.delete(selectedDivision.id);
      setIsDeleteModalOpen(false);
      setSelectedDivision(null);
    } catch (error) {
      errorHandler.handle(error as Error, "부문 삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">부문 관리</h1>
            <p className="mt-2 text-muted-foreground">부문을 생성, 수정, 삭제할 수 있습니다</p>
          </div>
          <Button onClick={handleCreate} disabled={!selectedCompetitionId} className="self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            부문 생성
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

      {/* Division Cards */}
      <div className="space-y-4">
        {!selectedCompetitionId ? (
          <Card>
            <CardContent className="text-center py-8">
              <List className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">대회를 선택해주세요</h3>
              <p className="text-muted-foreground">먼저 대회를 선택한 후 부문을 관리할 수 있습니다.</p>
            </CardContent>
          </Card>
        ) : divisions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <List className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">부문이 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                선택된 대회에 아직 부문이 없습니다. 새로운 부문을 생성해보세요.
              </p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="w-4 h-4 mr-2" />첫 번째 부문 생성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          divisions.map((division: Division) => {
            const statusInfo = getStatusVariant(division.status);
            return (
              <Card key={division.id} className="hover:shadow-md transition-shadow">
                <CardContent className="px-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{division.name}</h3>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          {statusInfo.text}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{division.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {Math.floor(division.timeLimit / 60)
                              .toString()
                              .padStart(2, "0")}
                            분 {(division.timeLimit % 60).toString().padStart(2, "0")}초
                          </span>
                        </div>
                        <span>생성일: {formatDate(division.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(division)}
                        className="h-9 w-9 p-0"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(division)}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 모달들 */}
      <AdminDivisionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        preSelectedCompetitionId={selectedCompetitionId}
        competitions={competitions}
      />

      <AdminDivisionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDivision(null);
        }}
        onSubmit={handleEditSubmit}
        division={selectedDivision}
        competitions={competitions}
      />

      <AdminDivisionDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDivision(null);
        }}
        onConfirm={handleDeleteConfirm}
        division={selectedDivision}
      />
    </div>
  );
}
