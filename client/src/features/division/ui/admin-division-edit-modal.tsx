import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/shared/ui"; // shared Public API
import type { Competition } from "@/entities/competition";
import type { Division, DivisionForm } from "@/entities/division";

type DivisionFormErrors = Partial<Record<keyof DivisionForm, string>>;

interface DivisionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DivisionForm) => Promise<void>;
  division: Division | null;
  competitions: Competition[]; // ← 훅 대신 주입
}

export function AdminDivisionEditModal({ isOpen, onClose, onSubmit, division, competitions }: DivisionEditModalProps) {
  const [formData, setFormData] = useState<DivisionForm>({
    competitionId: "",
    name: "",
    description: "",
    timeLimit: 60,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<DivisionFormErrors>({});

  // 모달 열릴 때 division 데이터로 초기화
  useEffect(() => {
    if (isOpen && division) {
      setFormData({
        competitionId: division.competitionId,
        name: division.name,
        description: division.description,
        timeLimit: division.timeLimit,
      });
      setErrors({});
    }
  }, [isOpen, division]);

  // ----------------------------- handlers -----------------------------
  const handleInputChange = (field: keyof DivisionForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: DivisionFormErrors = {};
    if (!formData.competitionId) newErrors.competitionId = "대회를 선택해주세요";
    if (!formData.name.trim()) newErrors.name = "부문명은 필수입니다";
    else if (formData.name.trim().length > 100) newErrors.name = "부문명은 100자를 초과할 수 없습니다";
    if (!formData.description.trim()) newErrors.description = "설명은 필수입니다";
    else if (formData.description.trim().length > 1000) newErrors.description = "설명은 1000자를 초과할 수 없습니다";
    if (formData.timeLimit < 1) newErrors.timeLimit = "제한 시간은 1분 이상이어야 합니다";
    else if (formData.timeLimit > 1440) newErrors.timeLimit = "제한 시간은 1440분(24시간)을 초과할 수 없습니다";
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        competitionId: formData.competitionId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        timeLimit: formData.timeLimit,
      });
      onClose();
    } catch (err) {
      console.error("Failed to update division:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrors({});
    onClose();
  };

  if (!division) return null;

  // ----------------------------- render -----------------------------
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="부문 수정" size="md" closeOnBackdrop={false}>
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
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.competitionId ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">대회를 선택하세요</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
              maxLength={100}
              disabled={isSubmitting}
              placeholder="부문명을 입력하세요"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
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
              maxLength={1000}
              disabled={isSubmitting}
              placeholder="부문 설명을 입력하세요"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
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
              min={1}
              max={1440}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.timeLimit ? "border-red-300" : "border-gray-300"
              }`}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
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
