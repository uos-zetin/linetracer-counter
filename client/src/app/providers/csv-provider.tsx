import { useMemo } from "react";
import { CsvContext, createCsvService } from "@/features/csv-to-competition";
import { useRepository } from "./use-repository";

export const CsvProvider = ({ children }: { children: React.ReactNode }) => {
  const { competitionRepository, divisionRepository, participantRepository } = useRepository();

  const csvService = useMemo(() => {
    return createCsvService({
      competitionRepository,
      divisionRepository,
      participantRepository,
    });
  }, [competitionRepository, divisionRepository, participantRepository]);

  return <CsvContext.Provider value={csvService}>{children}</CsvContext.Provider>;
};