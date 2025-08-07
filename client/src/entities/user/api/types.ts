import type { UserRegisterForm, User, UserRole, UserLoginForm } from "../model/types";

export type UserRoleDto = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface UserDto {
  id: string;
  name: string;
  roles: UserRoleDto[];
  createdAt: string; // ISO date string
}

export interface UserRegisterDto {
  name: string;
  username: string;
  password: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  registerUser(user: UserRegisterForm): Promise<User>;
  loginUser(user: UserLoginForm): Promise<string>;
  logoutUser(): Promise<void>;
  updateUserRoles(userId: string, roles: UserRole[]): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
