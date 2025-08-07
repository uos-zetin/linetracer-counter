import type { BaseEntityActions } from "@/shared/lib";

export type Participant = {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  createdAt: Date;
};

export type ParticipantForm = Pick<
  Participant,
  "divisionId" | "name" | "teamName" | "robotName" | "comment" | "orderRaw"
>;

export interface ParticipantActions extends BaseEntityActions<Participant> {
  addMany: (participants: Participant[]) => void;
}

export interface ParticipantStore extends ParticipantActions {
  participants: Participant[];
}
