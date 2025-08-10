import { useZustandUserStore, type UserRegisterForm, type UserRepository, type UserRole, type User } from "@/entities/user";
import type { UserService } from "./types";

interface UserServiceProps {
  userRepository: UserRepository;
}

export const createUserService = ({ userRepository }: UserServiceProps): UserService => {
  const loadAllUsers = async (): Promise<void> => {
    try {
      const store = useZustandUserStore.getState();
      const users = await userRepository.getAllUsers();
      store.init(users);
    } catch (error) {
      console.error("Failed to load all users:", error);
      throw error;
    }
  };

  const createUser = async (data: UserRegisterForm): Promise<User> => {
    try {
      const newUser = await userRepository.registerUser(data);
      const store = useZustandUserStore.getState();
      store.add(newUser);
      return newUser;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };

  const updateUserRoles = async (id: string, newRole: UserRole[]): Promise<User> => {
    try {
      const updatedUser = await userRepository.updateUserRoles(id, newRole);
      const store = useZustandUserStore.getState();
      store.update(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await userRepository.deleteUser(id);
      const store = useZustandUserStore.getState();
      store.remove(id);
    } catch (error) {
      console.error(`Failed to delete user ${id}:`, error);
      throw error;
    }
  };

  // Store 구독 메서드들
  const useUsers = () => {
    return useZustandUserStore((state) => state.users);
  };

  const useUserById = (id: string) => {
    const user = useZustandUserStore((state) => state.users.find((u) => u.id === id));
    return user || null;
  };

  return {
    // Load functions (공용)
    load: {
      all: loadAllUsers,
    },
    // Admin functions (관리자 전용)
    admin: {
      create: createUser,
      updateRoles: updateUserRoles,
      delete: deleteUser,
    },
    // Subscription hooks (구독)
    use: {
      users: useUsers,
      userById: useUserById,
    },
  };
};