export interface Division {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  status: "ready" | "ongoing" | "closed";
}
