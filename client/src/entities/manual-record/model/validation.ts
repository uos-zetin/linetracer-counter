import z from "zod";
import type { ManualRecordForm } from "./types";

export const ManualRecordFormSchema = z.object({
  value: z.number().min(0, "값은 0 이상이어야 합니다"),
  recorderName: z.string().min(1, "기록자 이름은 필수입니다").max(50, "기록자 이름은 50자를 초과할 수 없습니다").trim(),
}) satisfies z.ZodType<ManualRecordForm>;
