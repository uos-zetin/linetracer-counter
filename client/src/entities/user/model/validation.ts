import z from "zod";
import type { UserRegisterForm } from "./types";

export const UserFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(100, "이름은 100자 이하여야 합니다").trim(),
  roles: z.array(z.enum(["administrator", "manualRecorder", "stopwatchRecorder"])),
});

export const UserRegisterFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(100, "이름은 100자 이하여야 합니다").trim(),
  userName: z.string().min(1, "사용자명을 입력해주세요").max(50, "사용자명은 50자 이하여야 합니다").trim(),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다").max(100, "비밀번호는 100자 이하여야 합니다").trim(),
}) satisfies z.ZodType<UserRegisterForm>;
