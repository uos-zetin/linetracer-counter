import { useMemo } from "react";
import { createAdminUserService, AdminUserContext } from "@/features/admin-user";
import { useRepository } from "./use-repository";

export const AdminUserProvider = ({ children }: { children: React.ReactNode }) => {
  const { userRepository } = useRepository();

  const adminUserService = useMemo(() => {
    return createAdminUserService({
      userRepository,
    });
  }, [userRepository]);

  return <AdminUserContext.Provider value={adminUserService}>{children}</AdminUserContext.Provider>;
};
