// src/widgets/edit-user-role-modal.tsx
import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/shared/ui"; // shared Public API
import type { User, UserRole } from "@/entities/user";

type RoleFormErrors = { roles?: string };

interface UserEditRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: UserRole[]) => Promise<void>;
  user: User | null; // 수정 대상 사용자
}

const allRoles: UserRole[] = ["administrator", "manualRecorder", "stopwatchRecorder"];

export function UserEditRolesModal({ isOpen, onClose, onSubmit, user }: UserEditRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 열릴 때 사용자 권한으로 초기화
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoles(user.roles);
      setErrors({});
    }
  }, [isOpen, user]);

  // ----------------------------- helpers -----------------------------
  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
    if (errors.roles) setErrors({});
  };

  const validate = () => {
    if (selectedRoles.length === 0) {
      setErrors({ roles: "최소 1개 이상의 역할을 선택해주세요" });
      return false;
    }
    setErrors({});
    return true;
  };

  // ----------------------------- submit / close -----------------------------
  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRoles);
      onClose();
    } catch (err) {
      console.error("권한 수정 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  // ----------------------------- render -----------------------------
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="사용자 권한 수정"
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{user.name}</span> 님의 역할을 선택하세요.
        </p>

        {/* 역할 체크박스 */}
        <div className="space-y-2">
          {allRoles.map((role) => (
            <label key={role} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role)}
                onChange={() => toggleRole(role)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              {role}
            </label>
          ))}
        </div>
        {errors.roles && <p className="text-sm text-red-600">{errors.roles}</p>}
      </div>

      {/* Footer */}
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </ModalFooter>
    </Modal>
  );
}
