import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { createAdminUserService } from "@/features/admin-user";
import { AdminUserContext } from "@/features/admin-user";

export const AdminUserProvider = ({ children }: { children: React.ReactNode }) => {
  const { userRepository } = useRepository();

  const adminUserService = useMemo(() => {
    return createAdminUserService({
      userRepository,
    });
  }, [userRepository]);

  return <AdminUserContext.Provider value={adminUserService}>{children}</AdminUserContext.Provider>;
};
