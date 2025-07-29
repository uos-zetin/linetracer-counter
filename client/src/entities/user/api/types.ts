import type { UserRegisterForm, User, UserRole, UserLoginForm } from "../model/types";

export interface UserDto {
  id: string;
  name: string;
  roles: string[];
  createdAt: string; // ISO date string
}

export interface RegisterUserDto {
  name: string;
  userName: string;
  password: string;
}

export interface LoginUserDto {
  userName: string;
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
