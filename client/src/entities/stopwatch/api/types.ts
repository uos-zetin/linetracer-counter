export interface StopwatchDto {
  id: string;
  name: string;
  startedAt: number | null;
  stoppedAt: number | null;
  divisionId: string | null;
}
