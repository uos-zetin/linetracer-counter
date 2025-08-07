import { z } from "zod";
import type { CompetitionForm } from "./types";

export const CompetitionFormSchema = z.object({
  name: z.string().min(1, "대회명은 필수입니다").max(100, "대회명은 100자를 초과할 수 없습니다").trim(),
  description: z.string().max(1000, "설명은 1000자를 초과할 수 없습니다").trim(),
}) satisfies z.ZodType<CompetitionForm>;
