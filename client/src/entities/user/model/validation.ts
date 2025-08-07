import z from "zod";
import type { UserForm, UserLoginForm, UserRegisterForm } from "./types";

export const UserFormSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다").max(50, "이름은 50자를 초과할 수 없습니다").trim(),
  roles: z.array(z.enum(["administrator", "manualRecorder", "stopwatchRecorder"])),
}) satisfies z.ZodType<UserForm>;

export const UserLoginFormSchema = z.object({
  userName: z.string().min(1, "사용자 이름은 필수입니다").max(50, "사용자 이름은 50자를 초과할 수 없습니다").trim(),
  password: z
    .string()
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다")
    .max(100, "비밀번호는 100자를 초과할 수 없습니다")
    .trim(),
}) satisfies z.ZodType<UserLoginForm>;

export const UserRegisterFormSchema = z.object({
  name: z.string().min(1, "이름은 필수입니다").max(50, "이름은 50자를 초과할 수 없습니다").trim(),
  userName: z.string().min(1, "사용자 이름은 필수입니다").max(50, "사용자 이름은 50자를 초과할 수 없습니다").trim(),
  password: z
    .string()
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다")
    .max(100, "비밀번호는 100자를 초과할 수 없습니다")
    .trim(),
}) satisfies z.ZodType<UserRegisterForm>;
