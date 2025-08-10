import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import type { Competition } from "@/entities/competition";
import type { Division, DivisionForm } from "@/entities/division";
import { useCompetitionService } from "@/features/competition";
import {
  useDivisionService,
  AdminDivisionCreateModal,
  AdminDivisionEditModal,
  AdminDivisionDeleteModal,
} from "@/features/division";

export function DivisionManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const divisionService = useDivisionService();
  const competitionService = useCompetitionService();
  const competitions = competitionService.use.competitions();

  const selectedCompetitionId = searchParams.get("competitionId") || "";
  const divisions = divisionService.use.divisionsByCompetition(selectedCompetitionId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.load.all().catch((error: unknown) => {
      console.error("Failed to load competitions:", error);
    });
  }, [divisionService, competitionService]);

  // 선택된 대회의 부문들 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      divisionService.load.byCompetition(selectedCompetitionId).catch((error: unknown) => {
        console.error("Failed to load divisions:", error);
      });
    }
  }, [divisionService, selectedCompetitionId]);

  // 대회 이름 찾기 헬퍼 함수
  const getCompetitionName = (competitionId: string): string => {
    const competition = competitions.find((c: Competition) => c.id === competitionId);
    return competition?.name || "알 수 없는 대회";
  };

  // 상태별 스타일 및 텍스트
  const getStatusInfo = (status: Division["status"]) => {
    switch (status) {
      case "ready":
        return { text: "준비", className: "bg-gray-100 text-gray-800" };
      case "ongoing":
        return { text: "진행중", className: "bg-green-100 text-green-800" };
      case "closed":
        return { text: "종료", className: "bg-red-100 text-red-800" };
      default:
        return { text: "알 수 없음", className: "bg-gray-100 text-gray-800" };
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
      console.error("Failed to create division:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleEditSubmit = async (data: DivisionForm) => {
    if (!selectedDivision) return;

    try {
      await divisionService.admin.update(selectedDivision.id, data);
      setIsEditModalOpen(false);
      setSelectedDivision(null);
    } catch (error) {
      console.error("Failed to update division:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDivision) return;

    try {
      await divisionService.admin.delete(selectedDivision.id);
      setIsDeleteModalOpen(false);
      setSelectedDivision(null);
    } catch (error) {
      console.error("Failed to delete division:", error);
      // TODO: 에러 처리 UI
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">부문 관리</h1>
            <p className="mt-2 text-gray-600">부문을 생성, 수정, 삭제할 수 있습니다</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedCompetitionId}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            부문 생성
          </button>
        </div>

        {/* 대회 선택 드롭다운 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <label htmlFor="competition-select" className="block text-sm font-medium text-gray-700 mb-2">
            대회 선택
          </label>
          <select
            id="competition-select"
            value={selectedCompetitionId}
            onChange={(e) => handleCompetitionSelect(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">대회를 선택하세요</option>
            {competitions.map((competition: Competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.name}
              </option>
            ))}
          </select>
          {selectedCompetitionId && (
            <p className="mt-2 text-sm text-blue-600">선택된 대회: {getCompetitionName(selectedCompetitionId)}</p>
          )}
        </div>
      </div>

      {/* Division Cards */}
      <div className="space-y-4">
        {!selectedCompetitionId ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">대회를 선택해주세요</h3>
            <p className="mt-1 text-sm text-gray-500">먼저 대회를 선택한 후 부문을 관리할 수 있습니다.</p>
          </div>
        ) : divisions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 12H5" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">부문이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              선택된 대회에 아직 부문이 없습니다. 새로운 부문을 생성해보세요.
            </p>
          </div>
        ) : (
          divisions.map((division: Division) => {
            const statusInfo = getStatusInfo(division.status);
            return (
              <div
                key={division.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{division.name}</h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{division.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        <strong>제한 시간:</strong> {division.timeLimit}분
                      </span>
                      <span>
                        <strong>생성일:</strong> {new Date(division.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(division)}
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
                      onClick={() => handleDelete(division)}
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
