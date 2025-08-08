import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import type { Competition } from "@/entities/competition";
import type { Division, DivisionForm } from "@/entities/division";
import { DivisionFormSchema } from "@/entities/division";

interface DivisionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DivisionForm) => Promise<void>;
  division: Division | null;
  competitions: Competition[];
}

export function AdminDivisionEditModal({ isOpen, onClose, onSubmit, division, competitions }: DivisionEditModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<DivisionForm>({
    resolver: zodResolver(DivisionFormSchema),
    defaultValues: {
      competitionId: "",
      name: "",
      description: "",
      timeLimit: 60,
    },
  });

  const descriptionValue = watch("description", "");
  const competitionId = watch("competitionId");

  // 모달 열릴 때 division 데이터로 초기화
  useEffect(() => {
    if (isOpen && division) {
      reset({
        competitionId: division.competitionId,
        name: division.name,
        description: division.description,
        timeLimit: division.timeLimit,
      });
    }
  }, [isOpen, division, reset]);

  const onSubmitHandler = async (data: DivisionForm) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      console.error("Failed to update division:", err);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!division) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>부문 수정</DialogTitle>
          <DialogDescription>
            부문 정보를 수정해주세요.
          </DialogDescription>
        </DialogHeader>

        <form id="division-edit-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 대회 선택 */}
          <div>
            <label htmlFor="competitionId" className="block text-sm font-medium text-gray-700 mb-1">
              대회 <span className="text-red-500">*</span>
            </label>
            <Select 
              value={competitionId} 
              onValueChange={(value) => setValue("competitionId", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className={errors.competitionId ? "border-red-300" : ""}>
                <SelectValue placeholder="대회를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((competition) => (
                  <SelectItem key={competition.id} value={competition.id}>
                    {competition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.competitionId && <p className="mt-1 text-sm text-red-600">{errors.competitionId.message}</p>}
          </div>

          {/* 부문명 */}
          <div>
            <label htmlFor="division-name" className="block text-sm font-medium text-gray-700 mb-1">
              부문명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="division-name"
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-300" : ""}
              placeholder="부문명을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* 설명 */}
          <div>
            <label htmlFor="division-description" className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <Textarea
              id="division-description"
              {...register("description")}
              rows={3}
              className={errors.description ? "border-red-300" : ""}
              placeholder="부문 설명을 입력하세요 (선택사항)"
              maxLength={1000}
              disabled={isSubmitting}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            <p className="mt-1 text-sm text-gray-500">{descriptionValue.length}/1000자</p>
          </div>

          {/* 제한 시간 */}
          <div>
            <label htmlFor="division-timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
              제한 시간 (분) <span className="text-red-500">*</span>
            </label>
            <Input
              id="division-timeLimit"
              type="number"
              {...register("timeLimit", { valueAsNumber: true })}
              className={errors.timeLimit ? "border-red-300" : ""}
              placeholder="제한 시간을 분 단위로 입력하세요"
              min={1}
              max={1440}
              disabled={isSubmitting}
            />
            {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit.message}</p>}
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
            form="division-edit-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}