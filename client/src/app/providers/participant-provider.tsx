import { useMemo } from "react";
import { participantServiceContext, createParticipantService, type ParticipantService } from "@/features/participant";
import { useRepository } from "./use-repository";

export const ParticipantProvider = ({ children }: { children: React.ReactNode }) => {
  const { participantRepository } = useRepository();

  const participantService = useMemo(() => {
    const service: ParticipantService = createParticipantService({
      participantRepository,
    });

    return service;
  }, [participantRepository]);

  return <participantServiceContext.Provider value={participantService}>{children}</participantServiceContext.Provider>;
};
