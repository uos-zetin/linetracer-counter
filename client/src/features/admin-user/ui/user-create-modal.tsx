import { useState } from "react";
import { Modal, ModalFooter } from "@/shared"; // shared Public API
import type { UserForm, UserRole } from "@/entities/user";

type UserFormErrors = Partial<Record<keyof UserForm, string>>;

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserForm) => Promise<void>;
  // 선택값 고정이 필요하면 preSelectedRoles?: UserRole[]; 등을 추가할 수 있습니다.
}

const allRoles: UserRole[] = ["administrator", "manualRecorder", "stopwatchRecorder"];

export function UserCreateModal({ isOpen, onClose, onSubmit }: UserCreateModalProps) {
  const [formData, setFormData] = useState<UserForm>({ name: "", roles: [] });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ----------------------------- helpers -----------------------------
  const handleInputChange = (field: keyof UserForm, value: string | UserRole[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleRole = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
    }));
    if (errors.roles) setErrors((prev) => ({ ...prev, roles: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: UserFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요";
    if (formData.roles.length === 0) newErrors.roles = "최소 1개 이상의 역할을 선택해주세요";
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => v === undefined);
  };

  const resetForm = () => {
    setFormData({ name: "", roles: [] });
    setErrors({});
  };

  // ----------------------------- submit / close -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ name: formData.name.trim(), roles: formData.roles });
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

        {/* 역할 선택 */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            역할 <span className="text-red-500">*</span>
          </p>
          <div className="space-y-2">
            {allRoles.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.roles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                {role}
              </label>
            ))}
          </div>
          {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
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
