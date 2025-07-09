import type { Division } from "../model/types";

export interface DivisionDto {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: string;
  status: "ready" | "ongoing" | "closed";
}

export interface DivisionRepository {
  // Implement methods when api is ready
  getDivisions(competitionId: string): Promise<Division[]>;
}
