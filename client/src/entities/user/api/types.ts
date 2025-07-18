import type { User, UserRole } from "../model/types";

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

export interface LoginResult {
  user: User;
  sessionKey: string;
}

export interface UserRepository {
  getAllUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  registerUser(user: RegisterUserDto): Promise<User>;
  loginUser(user: LoginUserDto): Promise<LoginResult | null>;
  logoutUser(): Promise<void>;
  updateUserRoles(userId: string, roles: UserRole[]): Promise<User>;
  deleteUser(userId: string): Promise<void>;
}
