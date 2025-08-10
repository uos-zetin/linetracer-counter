import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input } from "@/shared/ui";
import type { UserRegisterForm } from "@/entities/user";
import { UserRegisterFormSchema } from "@/entities/user";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserRegisterForm) => Promise<void>;
}

export function AdminUserCreateModal({ isOpen, onClose, onSubmit }: UserCreateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserRegisterForm>({
    resolver: zodResolver(UserRegisterFormSchema),
    defaultValues: {
      name: "",
      userName: "",
      password: "",
    },
  });

  const onSubmitHandler = async (data: UserRegisterForm) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      console.error("사용자 생성 실패:", err);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 추가</DialogTitle>
          <DialogDescription>
            새로운 사용자를 추가해주세요.
          </DialogDescription>
        </DialogHeader>

        <form id="user-create-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 이름 */}
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="user-name"
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-300" : ""}
              placeholder="사용자 이름을 입력하세요"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* 사용자 ID */}
          <div>
            <label htmlFor="user-username" className="block text-sm font-medium text-gray-700 mb-1">
              사용자 ID <span className="text-red-500">*</span>
            </label>
            <Input
              id="user-username"
              type="text"
              {...register("userName")}
              className={errors.userName ? "border-red-300" : ""}
              placeholder="로그인에 사용할 ID를 입력하세요"
              maxLength={50}
              disabled={isSubmitting}
            />
            {errors.userName && <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              id="user-password"
              type="password"
              {...register("password")}
              className={errors.password ? "border-red-300" : ""}
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
        </form>

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
            type="submit"
            form="user-create-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "추가 중..." : "사용자 추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}