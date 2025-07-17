import { z } from "zod";
import type { ValidationResult, ValidationError, LoginFormData, RegisterFormData } from "../types";

// Zod 스키마 정의
const userNameSchema = z
  .string()
  .min(1, "사용자명을 입력해주세요.")
  .min(3, "사용자명은 3자 이상이어야 합니다.")
  .max(20, "사용자명은 20자 이하여야 합니다.")
  .regex(/^[a-zA-Z0-9-_]+$/, "사용자명은 영문, 숫자, -, _ 만 사용할 수 있습니다.");

const passwordSchema = z
  .string()
  .min(1, "비밀번호를 입력해주세요.")
  .min(6, "비밀번호는 6자 이상이어야 합니다.")
  .max(50, "비밀번호는 50자 이하여야 합니다.");

const nameSchema = z
  .string()
  .min(1, "이름을 입력해주세요.")
  .min(2, "이름은 2자 이상이어야 합니다.")
  .max(50, "이름은 50자 이하여야 합니다.")
  .transform((str) => str.trim());

const emailSchema = z.email("올바른 이메일 형식을 입력해주세요.").min(1, "이메일을 입력해주세요.");

// 로그인 폼 스키마
const loginFormSchema = z.object({
  userName: userNameSchema,
  password: passwordSchema,
});

// 회원가입 폼 스키마
const registerFormSchema = z
  .object({
    name: nameSchema,
    userName: userNameSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

/**
 * Zod 에러를 ValidationError 배열로 변환
 */
const zodErrorToValidationErrors = (error: z.ZodError): ValidationError[] => {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): ValidationError | null => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      field: "email",
      message: result.error.issues[0]?.message || "이메일이 올바르지 않습니다.",
    };
  }
  return null;
};

/**
 * 사용자명 검증
 */
export const validateUserName = (userName: string): ValidationError | null => {
  const result = userNameSchema.safeParse(userName);
  if (!result.success) {
    return {
      field: "userName",
      message: result.error.issues[0]?.message || "사용자명이 올바르지 않습니다.",
    };
  }
  return null;
};

/**
 * 비밀번호 검증
 */
export const validatePassword = (password: string): ValidationError | null => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      field: "password",
      message: result.error.issues[0]?.message || "비밀번호가 올바르지 않습니다.",
    };
  }
  return null;
};

/**
 * 이름 검증
 */
export const validateName = (name: string): ValidationError | null => {
  const result = nameSchema.safeParse(name);
  if (!result.success) {
    return {
      field: "name",
      message: result.error.issues[0]?.message || "이름이 올바르지 않습니다.",
    };
  }
  return null;
};

/**
 * 비밀번호 확인 검증
 */
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationError | null => {
  if (!confirmPassword) {
    return { field: "confirmPassword", message: "비밀번호 확인을 입력해주세요." };
  }

  if (password !== confirmPassword) {
    return { field: "confirmPassword", message: "비밀번호가 일치하지 않습니다." };
  }

  return null;
};

/**
 * 로그인 폼 전체 검증
 */
export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const result = loginFormSchema.safeParse(data);

  if (!result.success) {
    const errors = zodErrorToValidationErrors(result.error);
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

/**
 * 회원가입 폼 전체 검증
 */
export const validateRegisterForm = (data: RegisterFormData): ValidationResult => {
  const result = registerFormSchema.safeParse(data);

  if (!result.success) {
    const errors = zodErrorToValidationErrors(result.error);
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
};

// 추가: 타입 안전한 파싱 함수들 (옵셔널)
export const parseLoginForm = (data: unknown) => loginFormSchema.parse(data);
export const parseRegisterForm = (data: unknown) => registerFormSchema.parse(data);

// 추가: 스키마 export (다른 곳에서 재사용 가능)
export { loginFormSchema, registerFormSchema, userNameSchema, passwordSchema, nameSchema, emailSchema };
