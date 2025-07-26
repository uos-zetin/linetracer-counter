import type { Division, DivisionStatus } from "../model/types";

export interface DivisionDto {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: string;
  status: "ready" | "ongoing" | "closed";
}

export interface DivisionRepository {
  getAllDivisions(competitionId: string): Promise<Division[]>;
  getDivisionById(divisionId: string): Promise<Division | null>;
  createDivision(competitionId: string, division: Omit<Division, "id" | "createdAt">): Promise<Division>;
  updateDivision(divisionId: string, division: Division): Promise<Division | null>;
  updateDivisionStatus(divisionId: string, status: DivisionStatus): Promise<Division | null>;
  deleteDivision(divisionId: string): Promise<void>;
}
