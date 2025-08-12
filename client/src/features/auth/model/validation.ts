import { z } from "zod";
import type { LoginForm } from "./types";

// Unified validation schemas
export const LoginFormSchema = z.object({
  userName: z.string().min(1, "사용자명을 입력해주세요").max(50, "사용자명은 50자 이하여야 합니다"),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요")
    .min(6, "비밀번호는 6자 이상이어야 합니다")
    .max(100, "비밀번호는 100자 이하여야 합니다"),
}) satisfies z.ZodType<LoginForm>;

// Session validation schema
export const SessionCredentialSchema = z.object({
  sessionKey: z.string().min(1, "세션 키는 필수입니다"),
  expiresAt: z.number().positive("만료 시간은 양수여야 합니다"),
});

// Type definitions
export type SessionCredential = z.infer<typeof SessionCredentialSchema>;

// Parsing functions
export const parseSessionCredential = (data: unknown): SessionCredential | null => {
  try {
    return SessionCredentialSchema.parse(data);
  } catch (error) {
    console.warn("세션 데이터 검증 실패:", error);
    return null;
  }
};
