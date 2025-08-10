import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Textarea } from "@/shared/ui";
import type { CompetitionForm } from "@/entities/competition";
import { CompetitionFormSchema } from "@/entities/competition";

interface CompetitionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompetitionForm) => Promise<void>;
}

export function AdminCompetitionCreateModal({ isOpen, onClose, onSubmit }: CompetitionCreateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CompetitionForm>({
    resolver: zodResolver(CompetitionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionValue = watch("description", "");

  const onSubmitHandler = async (data: CompetitionForm) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to create competition:", err);
      // TODO: Toast 에러 처리
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
          <DialogTitle>새 대회 생성</DialogTitle>
          <DialogDescription>
            새로운 대회를 만들어주세요.
          </DialogDescription>
        </DialogHeader>
        
        <form id="competition-create-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 대회명 */}
          <div>
            <label htmlFor="competition-name" className="block text-sm font-medium text-gray-700 mb-1">
              대회명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="competition-name"
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-300" : ""}
              placeholder="대회명을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="competition-description" className="block text-sm font-medium text-gray-700 mb-1">
              설명 <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="competition-description"
              {...register("description")}
              rows={4}
              className={errors.description ? "border-red-300" : ""}
              placeholder="대회 설명을 입력하세요"
              maxLength={1000}
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            <p className="mt-1 text-sm text-gray-500">{descriptionValue.length}/1000자</p>
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
            form="competition-create-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
