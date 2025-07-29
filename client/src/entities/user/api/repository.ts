import type { UserRegisterForm, User, UserRole } from "../model/types";
import type { LoginUserDto, UserRepository } from "./types";
import type { Fetcher } from "@/shared";

export class UserFetcherRepository implements UserRepository {
  private readonly publicFetcher: Fetcher; // 인증 불필요한 요청용
  private readonly authenticatedFetcher: Fetcher; // 인증 필요한 요청용

  constructor(publicFetcher: Fetcher, authenticatedFetcher: Fetcher) {
    this.publicFetcher = publicFetcher;
    this.authenticatedFetcher = authenticatedFetcher;
  }

  async getAllUsers(): Promise<User[]> {
    const response = await this.authenticatedFetcher.get<User[]>("/actors");
    return response.data;
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await this.authenticatedFetcher.get<User | null>("/actors/whoami");
    return response.data;
  }

  async registerUser(user: UserRegisterForm): Promise<User> {
    const response = await this.publicFetcher.post<User>("/actors/register", {
      body: {
        name: user.name,
        username: user.userName, // 서버는 username을 사용
        password: user.password,
      },
    });
    return response.data;
  }

  async loginUser(user: LoginUserDto): Promise<string> {
    // 서버에서 세션 키를 직접 반환하므로, 로그인 성공 시 별도로 사용자 정보를 조회해야 함
    const sessionKeyResponse = await this.publicFetcher.post<string>("/actors/login", {
      body: {
        username: user.userName,
        password: user.password,
      },
    });

    return sessionKeyResponse.data;
  }

  async logoutUser(): Promise<void> {
    await this.authenticatedFetcher.post<void>("/actors/logout");
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const response = await this.authenticatedFetcher.patch<User>(`/actors/${userId}/roles`, {
      body: { roles },
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.authenticatedFetcher.delete<void>(`/actors/${userId}`);
  }
}
