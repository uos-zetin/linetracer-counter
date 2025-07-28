import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/shared/ui";
import type { Competition, CompetitionForm } from "@/entities/competition";

interface CompetitionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompetitionForm) => Promise<void>;
  competition: Competition | null;
}

export function CompetitionEditModal({
  isOpen,
  onClose,
  onSubmit,
  competition,
}: CompetitionEditModalProps) {
  const [formData, setFormData] = useState<CompetitionForm>({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CompetitionForm>>({});

  // 모달이 열릴 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen && competition) {
      setFormData({
        name: competition.name,
        description: competition.description,
      });
      setErrors({});
    }
  }, [isOpen, competition]);

  const handleInputChange = (field: keyof CompetitionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CompetitionForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = "대회명은 필수입니다";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "대회명은 100자를 초과할 수 없습니다";
    }

    if (!formData.description.trim()) {
      newErrors.description = "설명은 필수입니다";
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = "설명은 1000자를 초과할 수 없습니다";
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
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      
      // 성공 시 모달 닫기
      onClose();
    } catch (error) {
      console.error("Failed to update competition:", error);
      // TODO: 에러 처리 (toast 등)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", description: "" });
      setErrors({});
      onClose();
    }
  };

  if (!competition) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="대회 수정"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-4 space-y-4">
          {/* 대회명 */}
          <div>
            <label htmlFor="competition-name" className="block text-sm font-medium text-gray-700 mb-1">
              대회명 *
            </label>
            <input
              id="competition-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.name ? "border-red-300" : "border-gray-300"}
              `}
              placeholder="대회명을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="competition-description" className="block text-sm font-medium text-gray-700 mb-1">
              설명 *
            </label>
            <textarea
              id="competition-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${errors.description ? "border-red-300" : "border-gray-300"}
              `}
              placeholder="대회 설명을 입력하세요"
              maxLength={1000}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/1000자
            </p>
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
            {isSubmitting ? "수정 중..." : "수정"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}