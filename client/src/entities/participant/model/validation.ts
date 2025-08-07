import z from "zod";
import type { ParticipantForm } from "./types";

export const ParticipantFormSchema = z.object({
  divisionId: z.string().min(1, "참가자는 반드시 소속된 경연이 있어야 합니다."),
  name: z.string().min(1, "참가자 이름은 1자 이상이어야 합니다.").max(100, "참가자 이름은 100자를 초과할 수 없습니다."),
  teamName: z.string().min(1, "팀 이름은 1자 이상이어야 합니다.").max(100, "팀 이름은 100자를 초과할 수 없습니다."),
  robotName: z
    .string()
    .min(1, "로봇 이름은 1자 이상이어야 합니다.")
    .max(100, "로봇 이름은 100자를 초과할 수 없습니다."),
  comment: z.string().max(500, "코멘트는 500자를 초과할 수 없습니다."),
  orderRaw: z.number().max(500, "순서는 500 이하이어야 합니다."),
}) satisfies z.ZodType<ParticipantForm>;
