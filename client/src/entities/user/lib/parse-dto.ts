import type { UserDto, UserLoginDto, UserRegisterDto, UserRoleDto } from "../api/types";
import type { User, UserLoginForm, UserRegisterForm, UserRole } from "../model/types";

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

export function parseUserRegisterForm(form: UserRegisterForm): UserRegisterDto {
  return {
    name: form.name,
    username: form.userName, // 서버는 username을 사용
    password: form.password,
  };
}

export function parseUserLoginForm(form: UserLoginForm): UserLoginDto {
  return {
    username: form.userName,
    password: form.password,
  };
}
