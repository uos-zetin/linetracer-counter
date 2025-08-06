import { useState } from "react";
import { Modal, ModalFooter } from "@/shared/ui"; // shared Public API
import type { UserRegisterForm } from "@/entities/user";

type UserFormErrors = Partial<Record<keyof UserRegisterForm, string>>;

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserRegisterForm) => Promise<void>;
}

export function UserCreateModal({ isOpen, onClose, onSubmit }: UserCreateModalProps) {
  const [formData, setFormData] = useState<UserRegisterForm>({ name: "", userName: "", password: "" });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------------------- helpers -----------------------------
  const handleInputChange = (field: keyof UserRegisterForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (!formData.userName.trim()) newErrors.userName = "사용자 ID를 입력해주세요";
    if (!formData.password.trim()) newErrors.password = "비밀번호를 입력해주세요";
    if (formData.password.length < 4) newErrors.password = "비밀번호는 4자 이상이어야 합니다";
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === undefined);
  };

  const resetForm = () => {
    setFormData({ name: "", userName: "", password: "" });
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
      console.error("사용자 생성 실패:", err);
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
      title="사용자 추가"
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* 이름 */}
        <div>
          <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            id="user-name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="사용자 이름"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* 사용자 ID */}
        <div>
          <label htmlFor="user-username" className="block text-sm font-medium text-gray-700 mb-1">
            사용자 ID <span className="text-red-500">*</span>
          </label>
          <input
            id="user-username"
            value={formData.userName}
            onChange={(e) => handleInputChange("userName", e.target.value)}
            placeholder="로그인에 사용할 ID"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.userName ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName}</p>}
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 <span className="text-red-500">*</span>
          </label>
          <input
            id="user-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="비밀번호 (4자 이상)"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-300" : "border-gray-300"
            }`}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
            {isSubmitting ? "추가 중..." : "사용자 추가"}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
