import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import {
  useAdminParticipantService,
  ParticipantCreateModal,
  ParticipantEditModal,
  ParticipantDeleteModal,
} from "@/features/admin-participant";
import { useAdminCompetitionService } from "@/features/admin-competition";
import { useAdminDivisionService } from "@/features/admin-division";
import type { Participant, ParticipantForm } from "@/entities/participant";

// 페이지네이션 설정
const PARTICIPANTS_PER_PAGE = 5;

export function ParticipantManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const participantService = useAdminParticipantService();
  const competitionService = useAdminCompetitionService();
  const divisionService = useAdminDivisionService();

  const competitions = competitionService.useCompetitions();
  const selectedCompetitionId = searchParams.get("competitionId") || "";
  const divisions = divisionService.useDivisionsByCompetition(selectedCompetitionId);
  const allParticipants = participantService.useParticipants();

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    competitionService.loadAllCompetitions().catch((error) => {
      console.error("Failed to load competitions:", error);
    });
  }, [competitionService]);

  // 선택된 대회의 부문들 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      divisionService.loadDivisionsByCompetition(selectedCompetitionId).catch((error) => {
        console.error("Failed to load divisions:", error);
      });
    }
  }, [divisionService, selectedCompetitionId]);

  // 모든 부문의 참가자들을 한 번에 로드 - divisions가 로드된 후 실행
  useEffect(() => {
    if (divisions.length > 0) {
      const divisionIds = divisions.map((division) => division.id);
      participantService.loadParticipantsByDivisions(divisionIds).catch((error) => {
        console.error("Failed to load participants:", error);
      });
    }
  }, [participantService, divisions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // 대회 이름 찾기 헬퍼 함수
  const getCompetitionName = (competitionId: string): string => {
    const competition = competitions.find((c) => c.id === competitionId);
    return competition?.name || "알 수 없는 대회";
  };

  // 부문별 참가자 그룹화
  const getParticipantsByDivision = (divisionId: string): Participant[] => {
    return allParticipants.filter((p) => p.divisionId === divisionId).sort((a, b) => a.orderRaw - b.orderRaw);
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
      await participantService.createParticipant(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create participant:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleEditSubmit = async (data: ParticipantForm) => {
    if (!selectedParticipant) return;

    try {
      await participantService.updateParticipant(selectedParticipant.id, data);
      setIsEditModalOpen(false);
      setSelectedParticipant(null);
    } catch (error) {
      console.error("Failed to update participant:", error);
      // TODO: 에러 처리 UI
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedParticipant) return;

    try {
      await participantService.deleteParticipant(selectedParticipant.id);

      setIsDeleteModalOpen(false);
      setSelectedParticipant(null);
    } catch (error) {
      console.error("Failed to delete participant:", error);
      // TODO: 에러 처리 UI
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">참가자 관리</h1>
            <p className="mt-2 text-gray-600">참가자를 생성, 수정, 삭제할 수 있습니다</p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedCompetitionId}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            참가자 추가
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
            {competitions.map((competition) => (
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

      {/* 참가자 목록 (부문별) */}
      <div className="space-y-6">
        {!selectedCompetitionId ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">대회를 선택해주세요</h3>
            <p className="mt-1 text-sm text-gray-500">먼저 대회를 선택한 후 참가자를 관리할 수 있습니다.</p>
          </div>
        ) : divisions.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5m14 12H5" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">부문이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">선택된 대회에 아직 부문이 없습니다. 먼저 부문을 생성해주세요.</p>
          </div>
        ) : (
          divisions.map((division) => {
            const divisionParticipants = getParticipantsByDivision(division.id);
            const paginatedParticipants = getPaginatedParticipants(division.id);
            const totalPages = getTotalPages(division.id);
            const currentPageNum = getCurrentPage(division.id);

            return (
              <div key={division.id} className="bg-white border border-gray-200 rounded-lg">
                {/* 부문 헤더 */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{division.name}</h3>
                      <p className="text-sm text-gray-600">{division.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">총 {divisionParticipants.length}명</div>
                  </div>
                </div>

                {/* 참가자 목록 */}
                <div className="px-6 py-4">
                  {divisionParticipants.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">이 부문에 참가자가 없습니다.</p>
                    </div>
                  ) : (
                    <>
                      {/* 참가자 카드들 */}
                      <div className="space-y-3">
                        {paginatedParticipants.map((participant) => (
                          <div
                            key={participant.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                    {participant.orderRaw}
                                  </span>
                                  <h4 className="text-lg font-semibold text-gray-900">{participant.name}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">팀명:</span> {participant.teamName}
                                  </div>
                                  <div>
                                    <span className="font-medium">로봇명:</span> {participant.robotName}
                                  </div>
                                </div>
                                {participant.comment && (
                                  <p className="mt-2 text-sm text-gray-500">{participant.comment}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-400">
                                  등록일: {new Date(participant.createdAt).toLocaleDateString("ko-KR")}
                                </p>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => handleEdit(participant)}
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
                                  onClick={() => handleDelete(participant)}
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
                        ))}
                      </div>

                      {/* 페이지네이션 */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                          <button
                            onClick={() => setDivisionPage(division.id, Math.max(1, currentPageNum - 1))}
                            disabled={currentPageNum === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            이전
                          </button>
                          <span className="text-sm text-gray-700">
                            {currentPageNum} / {totalPages} 페이지
                          </span>
                          <button
                            onClick={() => setDivisionPage(division.id, Math.min(totalPages, currentPageNum + 1))}
                            disabled={currentPageNum === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            다음
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 모달들 */}
      <ParticipantCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        divisions={divisions}
      />

      <ParticipantEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedParticipant(null);
        }}
        onSubmit={handleEditSubmit}
        participant={selectedParticipant}
        divisions={divisions}
      />

      <ParticipantDeleteModal
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
