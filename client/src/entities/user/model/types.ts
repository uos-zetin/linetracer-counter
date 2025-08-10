import type { BaseEntityActions } from "@/shared/lib";

export type UserRole = "administrator" | "manualRecorder" | "stopwatchRecorder";

export type User = {
  id: string;
  name: string;
  roles: UserRole[];
  createdAt: Date;
};

export type UserForm = Pick<User, "name" | "roles">;

export type UserRegisterForm = {
  name: string;
  userName: string;
  password: string;
};

export interface UserActions extends BaseEntityActions<User> {
  addMany: (users: User[]) => void;
}

export interface UserStore extends UserActions {
  users: User[];
}
