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
  const form = useForm<ParticipantForm>({
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

  const commentValue = form.watch("comment", "");

  // preSelectedDivisionId 변경 시 반영
  useEffect(() => {
    if (preSelectedDivisionId) {
      form.setValue("divisionId", preSelectedDivisionId);
    }
  }, [preSelectedDivisionId, form]);

  const onSubmitHandler = async (data: ParticipantForm) => {
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } catch (err) {
      console.error("Failed to create participant:", err);
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
          <DialogTitle>새 참가자 생성</DialogTitle>
          <DialogDescription>새로운 참가자를 추가해주세요.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="participant-create-form" onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-4">
            {/* 부문 선택 */}
            <FormField
              control={form.control}
              name="divisionId"
              render={({ field }) => (
                <FormItem>
                  <label htmlFor="divisionId-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    부문 <span className="text-red-500">*</span>
                  </label>
                  <FormControl>
                    <Select
                      name="divisionId"
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!!preSelectedDivisionId || form.formState.isSubmitting}
                    >
                      <SelectTrigger id="divisionId-select">
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 참가자명 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    참가자명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="참가자명을 입력하세요"
                      maxLength={100}
                      disabled={form.formState.isSubmitting}
                      autoComplete="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 팀명 */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    팀명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="팀명을 입력하세요"
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

            {/* 로봇명 */}
            <FormField
              control={form.control}
              name="robotName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    로봇명 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="로봇명을 입력하세요"
                      maxLength={100}
                      disabled={form.formState.isSubmitting}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 순서 */}
            <FormField
              control={form.control}
              name="orderRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    순서 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="순서를 입력하세요"
                      min={1}
                      max={500}
                      disabled={form.formState.isSubmitting}
                      autoComplete="off"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 코멘트 */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>코멘트 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="코멘트를 입력하세요 (선택사항)"
                      maxLength={500}
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="mt-1 text-sm text-gray-500">{commentValue.length}/500자</p>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={form.formState.isSubmitting}>
            취소
          </Button>
          <Button type="submit" form="participant-create-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "생성 중..." : "생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}