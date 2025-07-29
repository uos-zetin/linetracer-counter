export interface Participant {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  createdAt: Date;
}

export interface ParticipantForm {
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
}

export interface ParticipantActions {
  init: (participants: Participant[]) => void;
  add: (participant: Participant) => void;
  addMany: (participants: Participant[]) => void;
  update: (participant: Participant) => void;
  remove: (participantId: string) => void;
}

export interface ParticipantGetters {
  getById: (participantId: string) => Participant | null;
}

export interface ParticipantStore extends ParticipantActions, ParticipantGetters {
  participants: Participant[];
}
