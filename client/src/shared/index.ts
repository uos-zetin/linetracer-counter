export * from "./api/errors";
export * from "./api/fetcher";
export { FetchApiFetcher } from "./api/fetcher.fetch";
export { AuthenticatedFetcher } from "./api/fetcher.authenticated";
export type { SessionProvider } from "./api/fetcher.authenticated";

import { FetchApiFetcher } from "./api/fetcher.fetch";
import type { Fetcher } from "./api/fetcher";

const fetcherBaseUrl = import.meta.env.DEV ? "/api" : import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

/**
 * 애플리케이션에서 사용할 기본 fetcher 인스턴스 (인증 불필요)
 * 로그인, 회원가입 등 인증이 필요없는 API에 사용
 */
export const fetcher: Fetcher = new FetchApiFetcher(fetcherBaseUrl);

/**
 * 특정 base URL을 가진 fetcher를 생성하는 팩토리 함수
 */
export const createFetcher = (baseUrl: string, defaultHeaders?: Record<string, string>): Fetcher => {
  return new FetchApiFetcher(baseUrl, defaultHeaders);
};
