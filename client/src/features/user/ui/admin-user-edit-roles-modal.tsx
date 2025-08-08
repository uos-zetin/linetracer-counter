import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from "@/shared/ui";
import type { User, UserRole } from "@/entities/user";

type RoleFormErrors = { roles?: string };

interface UserEditRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: UserRole[]) => Promise<void>;
  user: User | null;
}

const allRoles: UserRole[] = ["administrator", "manualRecorder", "stopwatchRecorder"];
const roleLabels: Record<UserRole, string> = {
  administrator: "관리자",
  manualRecorder: "수동 기록자",
  stopwatchRecorder: "스톱워치 기록자",
};

export function AdminUserEditRolesModal({ isOpen, onClose, onSubmit, user }: UserEditRolesModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [errors, setErrors] = useState<RoleFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setSelectedRoles(user.roles);
      setErrors({});
    }
  }, [isOpen, user]);

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => 
      prev.includes(role) 
        ? prev.filter((r) => r !== role) 
        : [...prev, role]
    );
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

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 권한 수정</DialogTitle>
          <DialogDescription>
            <span className="font-semibold">{user.name}</span> 님의 역할을 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            {allRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <input
                  id={role}
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isSubmitting}
                />
                <label htmlFor={role} className="text-sm font-medium text-gray-700">
                  {roleLabels[role]}
                </label>
              </div>
            ))}
          </div>
          {errors.roles && (
            <p className="text-sm text-red-600">{errors.roles}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
