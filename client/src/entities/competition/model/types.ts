import type { BaseEntityActions } from "@/shared/lib";

export type Competition = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
};

export type CompetitionForm = Pick<Competition, "name" | "description">;

export interface CompetitionStore extends BaseEntityActions<Competition> {
  competitions: Competition[]; // 대회 상태를 저장하는 배열 (생성일시 역순 정렬)
}
