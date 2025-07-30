// UI exports
export { LoginForm } from "./ui/login-form";
export { AuthDebugWrapper } from "./ui/auth-debug";

// 검증 관련 exports (UI 폼 + API 모델 통합)
export {
  validateLoginForm,
  validateRegisterForm,
  validateUserName,
  validatePassword,
  validateName,
  validateConfirmPassword,
  parseLoginForm,
  parseRegisterForm,
  loginFormSchema,
  registerFormSchema,
  userNameSchema,
  passwordSchema,
  nameSchema,
  SessionCredentialSchema,
  LoginInputSchema,
  RegisterInputSchema,
  parseSessionCredential,
  validateLoginInput,
  validateRegisterInput,
} from "./lib/validation";

// Auth Service exports
export { createAuthService } from "./model/auth-service";
export { useAuthService, authServiceContext } from "./model/context";
export { AuthServiceSessionProvider } from "./lib/session-provider";
export type { AuthService, AuthState } from "./model/types";
