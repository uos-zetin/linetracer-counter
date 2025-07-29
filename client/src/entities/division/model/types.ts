export type DivisionStatus = "ready" | "ongoing" | "closed";

export interface Division {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: DivisionStatus;
  timeLimit: number;
}

export interface DivisionForm {
  competitionId: string;
  name: string;
  description: string;
  timeLimit: number;
}

export interface DivisionActions {
  init: (divisions: Division[]) => void;
  add: (division: Division) => void;
  update: (division: Division) => void;
  remove: (divisionId: string) => void;
  clearAll: () => void;
}

export interface DivisionGetters {
  getById: (divisionId: string) => Division | null;
  getAll: () => Division[];
}

export interface DivisionStore extends DivisionActions, DivisionGetters {
  divisions: Division[];
}
