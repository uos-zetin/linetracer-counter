import { useMemo } from "react";
import { useRepository } from "./use-repository";
import { divisionServiceContext, createDivisionService, type DivisionService } from "@/features/division";

export const DivisionProvider = ({ children }: { children: React.ReactNode }) => {
  const { divisionRepository } = useRepository();

  const divisionService = useMemo(() => {
    const service: DivisionService = createDivisionService({
      divisionRepository,
    });

    return service;
  }, [divisionRepository]);

  return <divisionServiceContext.Provider value={divisionService}>{children}</divisionServiceContext.Provider>;
};