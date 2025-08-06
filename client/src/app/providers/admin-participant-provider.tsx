import { useMemo } from "react";
import { AdminParticipantContext, createAdminParticipantService } from "@/features/admin-participant";
import { useRepository } from "./use-repository";

export const AdminParticipantProvider = ({ children }: { children: React.ReactNode }) => {
  const { participantRepository } = useRepository();

  const adminParticipantService = useMemo(() => {
    return createAdminParticipantService({
      participantRepository,
    });
  }, [participantRepository]);

  return (
    <AdminParticipantContext.Provider value={adminParticipantService}>{children}</AdminParticipantContext.Provider>
  );
};
