export type DivisionStatus = "ready" | "ongoing" | "closed";

export interface Division {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: DivisionStatus;
}
