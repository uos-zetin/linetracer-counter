import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/shared";
import { useAdminCompetitionService } from "@/features/admin-competition";
import type { DivisionForm } from "@/entities/division";
import type { Competition } from "@/entities/competition";

interface DivisionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DivisionForm) => Promise<void>;
  preSelectedCompetitionId?: string;
}

export function DivisionCreateModal({ isOpen, onClose, onSubmit, preSelectedCompetitionId }: DivisionCreateModalProps) {
  const competitionService = useAdminCompetitionService();
  const competitions = competitionService.useCompetitions();

  const [formData, setFormData] = useState<DivisionForm>({
    competitionId: preSelectedCompetitionId || "",
    name: "",
    description: "",
    timeLimit: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<DivisionForm>>({});

  // 모달이 열릴 때 대회 목록 로드
  useEffect(() => {
    if (isOpen) {
      competitionService.loadAllCompetitions().catch(console.error);
    }
  }, [isOpen]);

  // preSelectedCompetitionId가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (preSelectedCompetitionId) {
      setFormData((prev) => ({ ...prev, competitionId: preSelectedCompetitionId }));
    }
  }, [preSelectedCompetitionId]);

  const handleInputChange = (field: keyof DivisionForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DivisionForm> = {};

    if (!formData.competitionId) {
      newErrors.competitionId = "대회를 선택해주세요";
    }

    if (!formData.name.trim()) {
      newErrors.name = "부문명은 필수입니다";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "부문명은 100자를 초과할 수 없습니다";
    }

    if (!formData.description.trim()) {
      newErrors.description = "설명은 필수입니다";
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = "설명은 1000자를 초과할 수 없습니다";
    }

    if (formData.timeLimit < 1) {
      newErrors.timeLimit = "제한 시간은 1분 이상이어야 합니다";
    } else if (formData.timeLimit > 1440) {
      newErrors.timeLimit = "제한 시간은 1440분(24시간)을 초과할 수 없습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        competitionId: formData.competitionId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        timeLimit: formData.timeLimit,
      });

      // 성공 시 폼 초기화 및 모달 닫기
      setFormData({
        competitionId: preSelectedCompetitionId || "",
        name: "",
        description: "",
        timeLimit: 60,
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Failed to create division:", error);
      // TODO: 에러 처리 (toast 등)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        competitionId: preSelectedCompetitionId || "",
        name: "",
        description: "",
        timeLimit: 60,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 부문 생성" size="md">
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 space-y-4">
          {/* 대회 선택 */}
          <div>
            <label htmlFor="division-competition" className="block text-sm font-medium text-gray-700 mb-1">
              대회 *
            </label>
            <select
              id="division-competition"
              value={formData.competitionId}
              onChange={(e) => handleInputChange("competitionId", e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.competitionId ? "border-red-300" : "border-gray-300"}
              `}
              disabled={isSubmitting || !!preSelectedCompetitionId}
            >
              <option value="">대회를 선택하세요</option>
              {competitions.map((competition) => (
                <option key={competition.id} value={competition.id}>
                  {competition.name}
                </option>
              ))}
            </select>
            {errors.competitionId && <p className="mt-1 text-sm text-red-600">{errors.competitionId}</p>}
          </div>

          {/* 부문명 */}
          <div>
            <label htmlFor="division-name" className="block text-sm font-medium text-gray-700 mb-1">
              부문명 *
            </label>
            <input
              id="division-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.name ? "border-red-300" : "border-gray-300"}
              `}
              placeholder="부문명을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="division-description" className="block text-sm font-medium text-gray-700 mb-1">
              설명 *
            </label>
            <textarea
              id="division-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.description ? "border-red-300" : "border-gray-300"}
              `}
              placeholder="부문 설명을 입력하세요"
              maxLength={1000}
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            <p className="mt-1 text-sm text-gray-500">{formData.description.length}/1000자</p>
          </div>

          {/* 제한 시간 */}
          <div>
            <label htmlFor="division-time-limit" className="block text-sm font-medium text-gray-700 mb-1">
              제한 시간 (분) *
            </label>
            <input
              id="division-time-limit"
              type="number"
              value={formData.timeLimit}
              onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value) || 0)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.timeLimit ? "border-red-300" : "border-gray-300"}
              `}
              min={1}
              max={1440}
              disabled={isSubmitting}
            />
            {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>}
            <p className="mt-1 text-sm text-gray-500">1분 ~ 1440분(24시간) 사이로 설정하세요</p>
          </div>
        </div>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "생성 중..." : "생성"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
