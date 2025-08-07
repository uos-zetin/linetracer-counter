import z from "zod";
import type { RecordForm } from "./types";

export const RecordFormSchema = z.object({
  value: z.number().min(0),
  source: z.enum(["stopwatch", "manual", "other"]),
  note: z.string().max(500),
}) satisfies z.ZodType<RecordForm>;
