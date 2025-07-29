import type { User, UserRegisterForm, UserRole } from "@/entities/user";

export interface AdminUserService {
  // Store state updates
  loadAllUsers: () => Promise<void>;
  createUser: (data: UserRegisterForm) => Promise<void>;
  updateUserRoles: (id: string, newRole: UserRole[]) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Store 구독 메서드들
  useUsers: () => User[];
  useUserById: (id: string) => User | null;
}
