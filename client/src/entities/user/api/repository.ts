import type { User, UserRole } from "../model/types";
import type { LoginUserDto, RegisterUserDto, UserRepository, LoginResult } from "./types";
import type { Fetcher } from "@/shared";

export class UserRepositoryImpl implements UserRepository {
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

  async registerUser(user: RegisterUserDto): Promise<User> {
    const response = await this.publicFetcher.post<User>("/actors/register", {
      body: {
        name: user.name,
        username: user.userName, // 서버는 username을 사용
        password: user.password,
      },
    });
    return response.data;
  }

  async loginUser(user: LoginUserDto): Promise<LoginResult | null> {
    // 서버에서 세션 키를 직접 반환하므로, 로그인 성공 시 별도로 사용자 정보를 조회해야 함
    const sessionKeyResponse = await this.publicFetcher.post<string>("/actors/login", {
      body: {
        username: user.userName,
        password: user.password,
      },
    });

    // 세션 키를 받았으면 해당 세션으로 사용자 정보 조회
    if (sessionKeyResponse.data) {
      // 임시로 세션 키를 헤더에 추가해서 whoami 호출
      const userResponse = await this.publicFetcher.get<User>("/actors/whoami", {
        headers: {
          Authorization: `Bearer ${sessionKeyResponse.data}`,
        },
      });

      return {
        user: userResponse.data,
        sessionKey: sessionKeyResponse.data,
      };
    }

    return null;
  }

  async logoutUser(): Promise<void> {
    await this.authenticatedFetcher.post<void>("/actors/logout");
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const response = await this.authenticatedFetcher.post<User>(`/actors/${userId}/roles`, {
      body: { roles },
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.authenticatedFetcher.delete<void>(`/actors/${userId}`);
  }
}
