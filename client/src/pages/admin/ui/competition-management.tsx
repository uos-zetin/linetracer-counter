import { useEffect, useState } from "react";
import { useAdminCompetitionService, CompetitionCreateModal, CompetitionEditModal, CompetitionDeleteModal } from "@/features/admin-competition";
import type { Competition, CompetitionForm } from "@/entities/competition";

export function CompetitionManagement() {
  const adminService = useAdminCompetitionService();
  const competitions = adminService.useCompetitions();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    adminService.loadAllCompetitions().catch((error) => {
      console.error("Failed to load competitions:", error);
    });
  }, [adminService]);

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
      await adminService.createCompetition(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create competition:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleEditSubmit = async (data: CompetitionForm) => {
    if (!selectedCompetition) return;

    try {
      await adminService.updateCompetition(selectedCompetition.id, data);
      setIsEditModalOpen(false);
      setSelectedCompetition(null);
    } catch (error) {
      console.error("Failed to update competition:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompetition) return;

    try {
      await adminService.deleteCompetition(selectedCompetition.id);
      setIsDeleteModalOpen(false);
      setSelectedCompetition(null);
    } catch (error) {
      console.error("Failed to delete competition:", error);
      // TODO: 에러 처리 UI
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대회 관리</h1>
          <p className="mt-2 text-gray-600">대회를 생성, 수정, 삭제할 수 있습니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          대회 생성
        </button>
      </div>

      {/* Competition Cards */}
      <div className="space-y-4">
        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">대회가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">새로운 대회를 생성해보세요.</p>
          </div>
        ) : (
          competitions.map((competition) => (
            <div
              key={competition.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{competition.name}</h3>
                  <p className="mt-2 text-gray-600">{competition.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    생성일: {new Date(competition.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(competition)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50"
                    title="수정"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(competition)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    title="삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 모달들 */}
      <CompetitionCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <CompetitionEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCompetition(null);
        }}
        onSubmit={handleEditSubmit}
        competition={selectedCompetition}
      />

      <CompetitionDeleteModal
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
