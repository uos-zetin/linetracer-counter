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
  Textarea,
} from "@/shared/ui";
import type { Competition, CompetitionForm } from "@/entities/competition";
import { CompetitionFormSchema } from "@/entities/competition";

interface CompetitionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompetitionForm) => Promise<void>;
  competition: Competition | null;
}

export function AdminCompetitionEditModal({ isOpen, onClose, onSubmit, competition }: CompetitionEditModalProps) {
  const form = useForm<CompetitionForm>({
    resolver: zodResolver(CompetitionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionValue = form.watch("description", "");

  // 모달 열릴 때 기존 데이터로 초기화
  useEffect(() => {
    if (isOpen && competition) {
      form.reset({
        name: competition.name,
        description: competition.description,
      });
    }
  }, [isOpen, competition, form]);

  const onSubmitHandler = async (data: CompetitionForm) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      console.error("Failed to update competition:", err);
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
          <DialogTitle>대회 수정</DialogTitle>
          <DialogDescription>대회 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="competition-edit-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* 대회명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    대회명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="대회명을 입력하세요"
                      maxLength={100}
                      disabled={form.formState.isSubmitting}
                      autoComplete="organization"
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
                      placeholder="대회 설명을 입력하세요 (선택사항)"
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
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
            취소
          </Button>
          <Button type="submit" form="competition-edit-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "수정 중..." : "수정"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}