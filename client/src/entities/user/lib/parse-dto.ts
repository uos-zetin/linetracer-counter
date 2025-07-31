import type { UserDto, UserRoleDto } from "../api/types";
import type { User, UserRole } from "../model/types";

export function parseUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    roles: dto.roles as UserRole[],
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
  };
}

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
