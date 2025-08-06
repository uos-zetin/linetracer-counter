import { useState } from "react";
import { Modal, ModalFooter } from "@/shared/ui";
import type { Division } from "@/entities/division";
import type { ParticipantForm } from "@/entities/participant";

type ParticipantFormErrors = Partial<Record<keyof ParticipantForm, string>>;

interface ParticipantCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ParticipantForm) => Promise<void>;
  divisions: Division[];
  preSelectedDivisionId?: string;
}

export function ParticipantCreateModal({
  isOpen,
  onClose,
  onSubmit,
  divisions,
  preSelectedDivisionId,
}: ParticipantCreateModalProps) {
  const [formData, setFormData] = useState<ParticipantForm>({
    divisionId: preSelectedDivisionId || "",
    name: "",
    teamName: "",
    robotName: "",
    comment: "",
    orderRaw: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ParticipantFormErrors>({});

  // ----------------------------- helpers -----------------------------
  const handleInputChange = (field: keyof ParticipantForm, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: ParticipantFormErrors = {};
    if (!formData.divisionId) newErrors.divisionId = "부문을 선택해주세요";
    if (!formData.name.trim()) newErrors.name = "참가자명을 입력해주세요";
    if (!formData.teamName.trim()) newErrors.teamName = "팀명을 입력해주세요";
    if (!formData.robotName.trim()) newErrors.robotName = "로봇명을 입력해주세요";
    if (formData.orderRaw < 1) newErrors.orderRaw = "참가 순서는 1 이상이어야 합니다";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      divisionId: preSelectedDivisionId || "",
      name: "",
      teamName: "",
      robotName: "",
      comment: "",
      orderRaw: 1,
    });
    setErrors({});
  };

  // ----------------------------- submit / close -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (err) {
      console.error("참가자 생성 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    resetForm();
  };

  // ----------------------------- render -----------------------------
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="참가자 추가"
      size="md"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* 부문 선택 */}
        <div>
          <label htmlFor="divisionId" className="block text-sm font-medium text-gray-700 mb-1">
            부문 <span className="text-red-500">*</span>
          </label>
          <select
            id="divisionId"
            value={formData.divisionId}
            onChange={(e) => handleInputChange("divisionId", e.target.value)}
            disabled={!!preSelectedDivisionId}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.divisionId ? "border-red-300" : "border-gray-300"
            }`}
          >
            <option value="">부문을 선택하세요</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {errors.divisionId && <p className="mt-1 text-sm text-red-600">{errors.divisionId}</p>}
        </div>

        {/* 참가자명 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            참가자명 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="참가자 이름을 입력하세요"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* 팀명 */}
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            팀명 <span className="text-red-500">*</span>
          </label>
          <input
            id="teamName"
            value={formData.teamName}
            onChange={(e) => handleInputChange("teamName", e.target.value)}
            placeholder="소속 팀명을 입력하세요"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.teamName ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.teamName && <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>}
        </div>

        {/* 로봇명 */}
        <div>
          <label htmlFor="robotName" className="block text-sm font-medium text-gray-700 mb-1">
            로봇명 <span className="text-red-500">*</span>
          </label>
          <input
            id="robotName"
            value={formData.robotName}
            onChange={(e) => handleInputChange("robotName", e.target.value)}
            placeholder="로봇 이름을 입력하세요"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.robotName ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.robotName && <p className="mt-1 text-sm text-red-600">{errors.robotName}</p>}
        </div>

        {/* 참가 순서 */}
        <div>
          <label htmlFor="orderRaw" className="block text-sm font-medium text-gray-700 mb-1">
            참가 순서 <span className="text-red-500">*</span>
          </label>
          <input
            id="orderRaw"
            type="number"
            min={1}
            value={formData.orderRaw}
            onChange={(e) => handleInputChange("orderRaw", parseInt(e.target.value) || 1)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.orderRaw ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.orderRaw && <p className="mt-1 text-sm text-red-600">{errors.orderRaw}</p>}
        </div>

        {/* 코멘트 */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            코멘트
          </label>
          <textarea
            id="comment"
            rows={3}
            value={formData.comment}
            onChange={(e) => handleInputChange("comment", e.target.value)}
            placeholder="참가자에 대한 추가 정보를 입력하세요 (선택사항)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer */}
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "추가 중..." : "참가자 추가"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
