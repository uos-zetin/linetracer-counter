// UI exports
export { AuthDebugWrapper } from "./ui/auth-debug";

// Model exports
export type { LoginForm, AuthService, AuthState } from "./model/types";
export { LoginFormSchema } from "./model/validation";

// API exports
export { AuthFetcherRepository } from "./api/repository";
export type { AuthRepository } from "./api/types";

// Library exports
export { parseLoginForm } from "./lib/parse-dto";
export { parseSessionCredential } from "./model/validation";

// Auth Service exports
export { createAuthService } from "./model/service";
export { useAuthService, authServiceContext } from "./model/context";
export { AuthServiceSessionProvider } from "./lib/session-provider";
