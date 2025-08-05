import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { competitionServiceContext, createCompetitionService, type CompetitionService } from "@/features/competition";

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