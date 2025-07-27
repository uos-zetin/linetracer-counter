export interface Competition {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface CompetitionForm {
  name: string;
  description: string;
}
