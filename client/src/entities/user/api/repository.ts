import type { Fetcher } from "@/shared/api";
import { parseUserDto, parseUserLoginForm, parseUserRegisterForm } from "../lib/parse-dto";
import type { UserRegisterForm, User, UserRole, UserLoginForm } from "../model/types";
import type { UserDto, UserRepository, UserRoleDto } from "./types";

export class UserFetcherRepository implements UserRepository {
  private readonly publicFetcher: Fetcher; // 인증 불필요한 요청용
  private readonly authenticatedFetcher: Fetcher; // 인증 필요한 요청용

  constructor(publicFetcher: Fetcher, authenticatedFetcher: Fetcher) {
    this.publicFetcher = publicFetcher;
    this.authenticatedFetcher = authenticatedFetcher;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.authenticatedFetcher.get<UserDto[]>("/actors");
    return response.data.map((userDto) => parseUserDto(userDto));
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await this.authenticatedFetcher.get<UserDto | null>("/actors/whoami");
    return response.data ? parseUserDto(response.data) : null;
  }

  async registerUser(user: UserRegisterForm): Promise<User> {
    const response = await this.publicFetcher.post<UserDto>("/actors/register", {
      body: parseUserRegisterForm(user),
    });
    return parseUserDto(response.data);
  }

  async loginUser(user: UserLoginForm): Promise<string> {
    // 서버에서 세션 키를 직접 반환하므로, 로그인 성공 시 별도로 사용자 정보를 조회해야 함
    const sessionKeyResponse = await this.publicFetcher.post<string>("/actors/login", {
      body: parseUserLoginForm(user),
    });

    return sessionKeyResponse.data;
  }

  async logoutUser(): Promise<void> {
    await this.authenticatedFetcher.post<void>("/actors/logout");
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const response = await this.authenticatedFetcher.patch<UserDto>(`/actors/${userId}/roles`, {
      body: { roles } as { roles: UserRoleDto[] },
    });
    return parseUserDto(response.data);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.authenticatedFetcher.delete<void>(`/actors/${userId}`);
  }
}
