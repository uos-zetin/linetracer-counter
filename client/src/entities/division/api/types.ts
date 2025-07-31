import type { Division, DivisionForm } from "../model/types";

export interface DivisionDto {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: string;
  status: "ready" | "ongoing" | "closed";
  timeLimit: number;
}

export interface DivisionCreateDto {
  name: string;
  description: string;
  timeLimit: number;
}

export interface DivisionRepository {
  getAllDivisions(competitionId: string): Promise<Division[]>;
  getDivisionById(divisionId: string): Promise<Division | null>;
  createDivision(competitionId: string, division: DivisionForm): Promise<Division>;
  updateDivision(division: Division): Promise<Division | null>;
  deleteDivision(divisionId: string): Promise<void>;
}
