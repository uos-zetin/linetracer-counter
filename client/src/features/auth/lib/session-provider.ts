import type { SessionProvider } from "@/shared";
import type { AuthService } from "../model/types";

/**
 * AuthService를 SessionProvider로 변환하는 어댑터
 */
export class AuthServiceSessionProvider implements SessionProvider {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  getSessionKey(): string | null {
    return this.authService.getSessionKey();
  }
}