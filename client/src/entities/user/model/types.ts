export type UserRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export interface User {
  id: string;
  name: string;
  roles: UserRole[];
  createdAt: Date;
}

export interface UserForm {
  name: string;
  roles: UserRole[];
}

export interface RegisterForm {
  name: string;
  userName: string;
  password: string;
}
