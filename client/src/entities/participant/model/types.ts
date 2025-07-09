export interface Participant {
  id: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  givenTime: number;
  createdAt: Date;
}
