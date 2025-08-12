import type { UserRegisterForm, User, UserRole } from "../model/types";

export type UserRoleDto = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface UserDto {
  id: string;
  name: string;
  roles: UserRoleDto[];
  createdAt: string; // ISO date string
}

export interface RegisterDto {
  name: string;
  username: string;
  password: string;
}

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  createUser(data: UserRegisterForm): Promise<User>;
  updateUserRoles(userId: string, roles: UserRole[]): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
