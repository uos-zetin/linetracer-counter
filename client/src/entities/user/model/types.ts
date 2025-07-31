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

export interface UserLoginForm {
  userName: string;
  password: string;
}

export interface UserRegisterForm {
  name: string;
  userName: string;
  password: string;
}

export interface UserActions {
  init: (users: User[]) => void;
  add: (user: User) => void;
  addMany: (users: User[]) => void;
  update: (user: User) => void;
  remove: (userId: string) => void;
}

export interface UserStore extends UserActions {
  users: User[];
}
