import type { RegisterDto, UserDto, UserRoleDto } from "../api/types";
import type { UserRegisterForm, User, UserRole } from "../model/types";

export function parseUserRoles(roles: UserRoleDto[]): UserRole[] {
  return roles.map((role) => {
    switch (role) {
      case "administrator":
      case "manualRecorder":
      case "stopwatchRecorder":
        return role;
      default:
        throw new Error(`Unknown user role: ${role}`);
    }
  });
}

export function parseUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    roles: parseUserRoles(dto.roles),
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
  };
}

export function parseUserRegisterForm(form: UserRegisterForm): RegisterDto {
  return {
    name: form.name,
    username: form.userName,
    password: form.password,
  };
}
