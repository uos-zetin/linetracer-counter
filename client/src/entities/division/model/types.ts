export interface Division {
  id: string;
  competitionId: string;
  name: string;
  description: string;
  createdAt: Date;
  status: "ready" | "ongoing" | "closed";
}
