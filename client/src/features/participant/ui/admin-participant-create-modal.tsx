import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui";
import type { Division } from "@/entities/division";
import type { ParticipantForm } from "@/entities/participant";
import { ParticipantFormSchema } from "@/entities/participant";

interface ParticipantCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ParticipantForm) => Promise<void>;
  divisions: Division[];
  preSelectedDivisionId?: string;
}

export function AdminParticipantCreateModal({
  isOpen,
  onClose,
  onSubmit,
  divisions,
  preSelectedDivisionId,
}: ParticipantCreateModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ParticipantForm>({
    resolver: zodResolver(ParticipantFormSchema),
    defaultValues: {
      divisionId: preSelectedDivisionId || "",
      name: "",
      teamName: "",
      robotName: "",
      comment: "",
      orderRaw: 1,
    },
  });

  const commentValue = watch("comment", "");
  const divisionId = watch("divisionId");

  const onSubmitHandler = async (data: ParticipantForm) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (err) {
      console.error("Failed to create participant:", err);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>참가자 추가</DialogTitle>
          <DialogDescription>
            새로운 참가자를 등록해주세요.
          </DialogDescription>
        </DialogHeader>

        <form id="participant-create-form" onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4">
          {/* 부문 선택 */}
          <div>
            <label htmlFor="divisionId" className="block text-sm font-medium text-gray-700 mb-1">
              부문 <span className="text-red-500">*</span>
            </label>
            <Select 
              value={divisionId} 
              onValueChange={(value) => setValue("divisionId", value)}
              disabled={!!preSelectedDivisionId || isSubmitting}
            >
              <SelectTrigger className={errors.divisionId ? "border-red-300" : ""}>
                <SelectValue placeholder="부문을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((division) => (
                  <SelectItem key={division.id} value={division.id}>
                    {division.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.divisionId && <p className="mt-1 text-sm text-red-600">{errors.divisionId.message}</p>}
          </div>

          {/* 참가자명 */}
          <div>
            <label htmlFor="participant-name" className="block text-sm font-medium text-gray-700 mb-1">
              참가자명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="participant-name"
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-300" : ""}
              placeholder="참가자 이름을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* 팀명 */}
          <div>
            <label htmlFor="participant-teamName" className="block text-sm font-medium text-gray-700 mb-1">
              팀명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="participant-teamName"
              type="text"
              {...register("teamName")}
              className={errors.teamName ? "border-red-300" : ""}
              placeholder="소속 팀명을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.teamName && <p className="mt-1 text-sm text-red-600">{errors.teamName.message}</p>}
          </div>

          {/* 로봇명 */}
          <div>
            <label htmlFor="participant-robotName" className="block text-sm font-medium text-gray-700 mb-1">
              로봇명 <span className="text-red-500">*</span>
            </label>
            <Input
              id="participant-robotName"
              type="text"
              {...register("robotName")}
              className={errors.robotName ? "border-red-300" : ""}
              placeholder="로봇 이름을 입력하세요"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.robotName && <p className="mt-1 text-sm text-red-600">{errors.robotName.message}</p>}
          </div>

          {/* 참가 순서 */}
          <div>
            <label htmlFor="participant-orderRaw" className="block text-sm font-medium text-gray-700 mb-1">
              참가 순서 <span className="text-red-500">*</span>
            </label>
            <Input
              id="participant-orderRaw"
              type="number"
              {...register("orderRaw", { valueAsNumber: true })}
              className={errors.orderRaw ? "border-red-300" : ""}
              placeholder="참가 순서를 입력하세요"
              min={1}
              max={500}
              disabled={isSubmitting}
            />
            {errors.orderRaw && <p className="mt-1 text-sm text-red-600">{errors.orderRaw.message}</p>}
          </div>

          {/* 코멘트 */}
          <div>
            <label htmlFor="participant-comment" className="block text-sm font-medium text-gray-700 mb-1">
              코멘트
            </label>
            <Textarea
              id="participant-comment"
              {...register("comment")}
              rows={3}
              className={errors.comment ? "border-red-300" : ""}
              placeholder="참가자에 대한 추가 정보를 입력하세요 (선택사항)"
              maxLength={500}
              disabled={isSubmitting}
            />
            {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
            <p className="mt-1 text-sm text-gray-500">{commentValue.length}/500자</p>
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
            form="participant-create-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? "추가 중..." : "참가자 추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}