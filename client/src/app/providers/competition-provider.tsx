import { useMemo } from "react";
import { competitionServiceContext, createCompetitionService, type CompetitionService } from "@/features/competition";
import { useRepository } from "./use-repository";

export const CompetitionProvider = ({ children }: { children: React.ReactNode }) => {
  const { competitionRepository } = useRepository();

  const competitionService = useMemo(() => {
    const service: CompetitionService = createCompetitionService({
      competitionRepository,
    });

    return service;
  }, [competitionRepository]);

  return <competitionServiceContext.Provider value={competitionService}>{children}</competitionServiceContext.Provider>;
};
