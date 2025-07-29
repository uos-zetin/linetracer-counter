import { useZustandUserStore, type UserRegisterForm, type UserRepository, type UserRole } from "@/entities/user";
import type { AdminUserService } from "./types";

interface AdminUserServiceProps {
  userRepository: UserRepository;
}

export const createAdminUserService = ({ userRepository }: AdminUserServiceProps): AdminUserService => {
  const loadAllUsers = async (): Promise<void> => {
    try {
      const store = useZustandUserStore.getState();
      store.init([]);
    } catch (error) {
      console.error("Failed to load all users:", error);
      throw error;
    }
  };

  const createUser = async (data: UserRegisterForm): Promise<void> => {
    try {
      const newUser = await userRepository.registerUser(data);
      const store = useZustandUserStore.getState();
      store.add(newUser);
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }
  };

  const updateUserRole = async (id: string, newRole: UserRole[]): Promise<void> => {
    try {
      const updatedUser = await userRepository.updateUserRoles(id, newRole);
      const store = useZustandUserStore.getState();
      store.update(updatedUser);
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
    const store = useZustandUserStore.getState();
    return store.users;
  };

  const useUserById = (id: string) => {
    const store = useZustandUserStore.getState();
    return store.getById(id);
  };

  return {
    loadAllUsers,
    createUser,
    updateUserRole,
    deleteUser,
    useUsers,
    useUserById,
  };
};
