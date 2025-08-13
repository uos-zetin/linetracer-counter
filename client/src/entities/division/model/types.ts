import type { BaseEntityActions } from "@/shared/lib";

export type DivisionStatus = "ready" | "ongoing" | "closed";

export const MAX_TIMELIMIT = 5999; // 5999초 = 99분 59초

export type Division = {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: DivisionStatus;
  timeLimit: number; // 초 단위
};

export type DivisionForm = Pick<Division, "competitionId" | "name" | "description" | "timeLimit">;

export interface DivisionStore extends BaseEntityActions<Division> {
  divisions: Division[];
}
