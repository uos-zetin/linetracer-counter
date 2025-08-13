import type { Fetcher } from "@/shared/api";
import { parseUserRegisterForm, parseUserDto } from "../lib/parse-dto";
import type { UserRegisterForm, User, UserRole } from "../model/types";
import type { UserDto, UserRepository, UserRoleDto } from "./types";

export class UserFetcherRepository implements UserRepository {
  private readonly authFetcher: Fetcher; // 인증 필요한 요청용

  constructor(authFetcher: Fetcher) {
    this.authFetcher = authFetcher;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.authFetcher.get<UserDto[]>("/actors");
    return response.data.map((userDto) => parseUserDto(userDto));
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await this.authFetcher.get<UserDto | null>("/actors/whoami");
    return response.data ? parseUserDto(response.data) : null;
  }

  async createUser(data: UserRegisterForm): Promise<User> {
    const response = await this.authFetcher.post<UserDto>("/actors/register", {
      body: parseUserRegisterForm(data),
    });
    return parseUserDto(response.data);
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const response = await this.authFetcher.patch<UserDto>(`/actors/${userId}/roles`, {
      body: { roles } as { roles: UserRoleDto[] },
    });
    return parseUserDto(response.data);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.authFetcher.delete<void>(`/actors/${userId}`);
  }
}
