import type { LoginForm } from "../model/types";

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthRepository {
  login(credentials: LoginForm): Promise<string>; // 세션 키 반환
  logout(): Promise<void>;
}
