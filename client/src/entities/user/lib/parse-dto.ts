import type { UserDto } from "../api/types";
import type { User, UserRole } from "../model/types";

export function parseUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    roles: dto.roles as UserRole[],
    createdAt: new Date(dto.createdAt), // ISO 문자열을 Date 객체로 변환
  };
}
