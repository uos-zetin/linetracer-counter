import { useMemo } from "react";
import {
  AdminCompetitionContext,
  createAdminCompetitionService,
  type AdminCompetitionService,
} from "@/features/admin-competition";
import { useRepository } from "./use-repository";

export const AdminCompetitionProvider = ({ children }: { children: React.ReactNode }) => {
  const { competitionRepository } = useRepository();

  const adminCompetitionService: AdminCompetitionService = useMemo(() => {
    return createAdminCompetitionService({
      competitionRepository,
    });
  }, [competitionRepository]);

  return (
    <AdminCompetitionContext.Provider value={adminCompetitionService}>{children}</AdminCompetitionContext.Provider>
  );
};
