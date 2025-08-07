import type { BaseEntityActions } from "@/shared/lib";

export type DivisionStatus = "ready" | "ongoing" | "closed";

export type Division = {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: DivisionStatus;
  timeLimit: number; // 밀리초 단위
};

// DivisionForm의 timeLimit은 분 단위로 설정
export type DivisionForm = Pick<Division, "competitionId" | "name" | "description" | "timeLimit">;

export interface DivisionStore extends BaseEntityActions<Division> {
  divisions: Division[];
}
