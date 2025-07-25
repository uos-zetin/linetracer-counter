export type UserRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  createdAt: Date;
}
