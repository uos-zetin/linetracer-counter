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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/shared/ui";
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
  const form = useForm<DivisionForm>({
    resolver: zodResolver(DivisionFormSchema),
    defaultValues: {
      competitionId: "",
      name: "",
      description: "",
      timeLimit: 60,
    },
  });

  const descriptionValue = form.watch("description", "");

  // 모달 열릴 때 division 데이터로 초기화
  useEffect(() => {
    if (isOpen && division) {
      form.reset({
        competitionId: division.competitionId,
        name: division.name,
        description: division.description,
        timeLimit: division.timeLimit,
      });
    }
  }, [isOpen, division, form]);

  const onSubmitHandler = async (data: DivisionForm) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to update division:", err);
    }
  };

  const handleClose = () => {
    if (form.formState.isSubmitting) return;
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>부문 수정</DialogTitle>
          <DialogDescription>부문 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="division-edit-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* 대회 선택 */}
            <FormField
              control={form.control}
              name="competitionId"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="competitionId-select-edit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    대회 <span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Select
                      name="competitionId"
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    >
                      <SelectTrigger id="competitionId-select-edit">
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 부문명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    부문명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="부문명을 입력하세요"
                      maxLength={100}
                      disabled={form.formState.isSubmitting}
                      autoComplete="organization-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 설명 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="부문 설명을 입력하세요 (선택사항)"
                      maxLength={1000}
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="mt-1 text-sm text-gray-500">{descriptionValue.length}/1000자</p>
                </FormItem>
              )}
            />

            {/* 제한 시간 */}
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    제한 시간 (분) <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="제한 시간을 분 단위로 입력하세요"
                      min={1}
                      max={1440}
                      disabled={form.formState.isSubmitting}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
          <Button type="submit" form="division-edit-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}