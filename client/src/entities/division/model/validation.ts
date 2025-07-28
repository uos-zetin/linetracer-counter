import { z } from "zod";

export const DivisionFormSchema = z.object({
  competitionId: z.string()
    .min(1, "대회를 선택해주세요"),
  name: z.string()
    .min(1, "부문명은 필수입니다")
    .max(100, "부문명은 100자를 초과할 수 없습니다")
    .trim(),
  description: z.string()
    .min(1, "설명은 필수입니다")
    .max(1000, "설명은 1000자를 초과할 수 없습니다")
    .trim(),
  timeLimit: z.number()
    .min(1, "제한 시간은 1분 이상이어야 합니다")
    .max(1440, "제한 시간은 1440분(24시간)을 초과할 수 없습니다"),
});

export type DivisionFormData = z.infer<typeof DivisionFormSchema>;