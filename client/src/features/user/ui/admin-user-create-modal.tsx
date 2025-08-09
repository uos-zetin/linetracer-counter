import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared/ui";
import type { UserRegisterForm } from "@/entities/user";
import { UserRegisterFormSchema } from "@/entities/user";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserRegisterForm) => Promise<void>;
}

export function AdminUserCreateModal({ isOpen, onClose, onSubmit }: UserCreateModalProps) {
  const form = useForm<UserRegisterForm>({
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
      form.reset();
      onClose();
    } catch (err) {
      console.error("사용자 생성 실패:", err);
    }
  };

  const handleClose = () => {
    if (form.formState.isSubmitting) return;
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 추가</DialogTitle>
          <DialogDescription>새로운 사용자를 추가해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="user-create-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* 이름 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    이름 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="이름을 입력하세요"
                      maxLength={50}
                      disabled={form.formState.isSubmitting}
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 사용자명 */}
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    사용자명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="사용자명을 입력하세요"
                      maxLength={50}
                      disabled={form.formState.isSubmitting}
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 비밀번호 */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    비밀번호 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호를 입력하세요 (최소 6자)"
                      maxLength={100}
                      disabled={form.formState.isSubmitting}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
            취소
          </Button>
          <Button type="submit" form="user-create-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}