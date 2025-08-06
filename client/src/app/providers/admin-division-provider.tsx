import { useMemo } from "react";
import { createAdminDivisionService, AdminDivisionContext } from "@/features/admin-division";
import { useRepository } from "./use-repository";

export const AdminDivisionProvider = ({ children }: { children: React.ReactNode }) => {
  const { divisionRepository } = useRepository();

  const adminDivisionService = useMemo(() => createAdminDivisionService({ divisionRepository }), [divisionRepository]);

  return <AdminDivisionContext.Provider value={adminDivisionService}>{children}</AdminDivisionContext.Provider>;
};
