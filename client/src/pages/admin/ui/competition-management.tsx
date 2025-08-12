import { useEffect, useState } from "react";
import { Plus, Trophy, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/shared/lib";
import { Button, Card, CardContent } from "@/shared/ui";
import type { Competition, CompetitionForm } from "@/entities/competition";
import {
  useCompetitionService,
  AdminCompetitionCreateModal,
  AdminCompetitionEditModal,
  AdminCompetitionDeleteModal,
} from "@/features/competition";
import { useErrorHandlingService } from "@/features/error-handling";

export function CompetitionManagement() {
  const competitionService = useCompetitionService();
  const competitions = competitionService.use.competitions();
  const errorHandler = useErrorHandlingService();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.load.all().catch((error) => {
      errorHandler.handle(error, "대회 목록 로드 중 오류가 발생했습니다");
    });
  }, [competitionService, errorHandler]);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsEditModalOpen(true);
  };

  const handleDelete = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (data: CompetitionForm) => {
    try {
      await competitionService.admin.create(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      errorHandler.handle(error as Error, "대회 생성 중 오류가 발생했습니다");
    }
  };

  const handleEditSubmit = async (data: CompetitionForm) => {
    if (!selectedCompetition) return;

    try {
      await competitionService.admin.update(selectedCompetition.id, data);
      setIsEditModalOpen(false);
      setSelectedCompetition(null);
    } catch (error) {
      errorHandler.handle(error as Error, "대회 수정 중 오류가 발생했습니다");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompetition) return;

    try {
      await competitionService.admin.delete(selectedCompetition.id);
      setIsDeleteModalOpen(false);
      setSelectedCompetition(null);
    } catch (error) {
      errorHandler.handle(error as Error, "대회 삭제 중 오류가 발생했습니다");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">대회 관리</h1>
          <p className="mt-2 text-muted-foreground">대회를 생성, 수정, 삭제할 수 있습니다</p>
        </div>
        <Button onClick={handleCreate} className="self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          대회 생성
        </Button>
      </div>

      {/* Competition Cards */}
      <div className="space-y-4">
        {competitions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-4">
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">대회가 없습니다</h3>
              <p className="text-muted-foreground mb-4">새로운 대회를 생성해보세요.</p>
              <Button onClick={handleCreate} variant="outline">
                <Plus className="w-4 h-4 mr-2" />첫 번째 대회 생성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          competitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardContent className="px-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{competition.name}</h3>
                    <p className="mt-2 text-muted-foreground">{competition.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">생성일: {formatDate(competition.createdAt)}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(competition)} className="h-9 w-9 p-0">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(competition)}
                      className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 모달들 */}
      <AdminCompetitionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <AdminCompetitionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCompetition(null);
        }}
        onSubmit={handleEditSubmit}
        competition={selectedCompetition}
      />

      <AdminCompetitionDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCompetition(null);
        }}
        onConfirm={handleDeleteConfirm}
        competition={selectedCompetition}
      />
    </div>
  );
}
