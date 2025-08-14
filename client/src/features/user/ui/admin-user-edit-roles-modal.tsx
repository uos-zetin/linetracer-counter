import { useEffect } from "react";
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
} from "@/shared/ui";
import type { User, UserRole } from "@/entities/user";
import { UserFormSchema } from "@/entities/user";
import { roleLabels } from "../model/types";

interface UserEditRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roles: UserRole[]) => Promise<void>;
  user: User | null;
}

const allRoles: UserRole[] = ["administrator", "manualRecorder", "stopwatchRecorder"];

type RoleFormData = {
  name: string;
  roles: UserRole[];
};

export function AdminUserEditRolesModal({ isOpen, onClose, onSubmit, user }: UserEditRolesModalProps) {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: "",
      roles: [],
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      form.reset({
        name: user.name,
        roles: user.roles,
      });
    }
  }, [isOpen, user, form]);

  const onSubmitHandler = async (data: RoleFormData) => {
    try {
      await onSubmit(data.roles);
      onClose();
    } catch (err) {
      console.error("권한 수정 실패:", err);
    }
  };

  const handleClose = () => {
    if (form.formState.isSubmitting) return;
    form.reset();
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

        <Form {...form}>
          <form id="user-roles-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>역할</FormLabel>
                  <div className="space-y-3">
                    {allRoles.map((role) => (
                      <FormItem key={role} className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value?.includes(role) || false}
                            onChange={(e) => {
                              const updatedRoles = e.target.checked
                                ? [...(field.value || []), role]
                                : field.value?.filter((r) => r !== role) || [];
                              field.onChange(updatedRoles);
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">{roleLabels[role]}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
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
          <Button type="submit" form="user-roles-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
