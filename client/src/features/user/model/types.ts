import type { User, UserRegisterForm, UserRole } from "@/entities/user";

export interface UserService {
  // Load functions (공용)
  load: {
    all: () => Promise<void>;
  };

  // Admin functions (관리자 전용)
  admin: {
    create: (data: UserRegisterForm) => Promise<User>;
    updateRoles: (id: string, newRole: UserRole[]) => Promise<User>;
    delete: (id: string) => Promise<void>;
  };

  // Subscription hooks (구독)
  use: {
    users: () => User[];
    userById: (id: string) => User | null;
  };
}
