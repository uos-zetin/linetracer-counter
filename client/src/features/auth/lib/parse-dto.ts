import type { LoginDto } from "../api/types";
import type { LoginForm } from "../model/types";

export function parseLoginForm(form: LoginForm): LoginDto {
  return {
    username: form.userName,
    password: form.password,
  };
}
