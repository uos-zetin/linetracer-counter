import { z } from "zod";

export const CompetitionFormSchema = z.object({
  name: z.string()
    .min(1, "대회명은 필수입니다")
    .max(100, "대회명은 100자를 초과할 수 없습니다")
    .trim(),
  description: z.string()
    .min(1, "설명은 필수입니다")
    .max(1000, "설명은 1000자를 초과할 수 없습니다")
    .trim(),
});

export type CompetitionFormInput = z.infer<typeof CompetitionFormSchema>;