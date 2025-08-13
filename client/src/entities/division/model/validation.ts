import { z } from "zod";
import { MAX_TIMELIMIT, type DivisionForm } from "./types";

export const DivisionFormSchema = z.object({
  competitionId: z.string().min(1, "대회를 선택해주세요"),
  name: z.string().min(1, "부문명은 필수입니다").max(100, "부문명은 100자를 초과할 수 없습니다").trim(),
  description: z.string().max(1000, "설명은 1000자를 초과할 수 없습니다").trim(),
  timeLimit: z
    .number()
    .min(1, "제한 시간은 1초 이상이어야 합니다")
    .max(MAX_TIMELIMIT, `제한 시간은 ${MAX_TIMELIMIT}초(99분 59초)를 초과할 수 없습니다`),
}) satisfies z.ZodType<DivisionForm>;
