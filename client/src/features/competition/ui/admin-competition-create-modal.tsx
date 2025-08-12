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
import type { CompetitionForm } from "@/entities/competition";
import { CompetitionFormSchema } from "@/entities/competition";

interface CompetitionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompetitionForm) => Promise<void>;
}

export function AdminCompetitionCreateModal({ isOpen, onClose, onSubmit }: CompetitionCreateModalProps) {
  const form = useForm<CompetitionForm>({
    resolver: zodResolver(CompetitionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const descriptionValue = form.watch("description", "");

  const onSubmitHandler = async (data: CompetitionForm) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to create competition:", err);
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
          <DialogTitle>새 대회 생성</DialogTitle>
          <DialogDescription>새로운 대회를 만들어주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="competition-create-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
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
          <Button type="submit" form="competition-create-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}