export * from "./api/errors";
export * from "./api/fetcher";
export { FetchApiFetcher } from "./api/fetcher.fetch";

import { FetchApiFetcher } from "./api/fetcher.fetch";
import type { Fetcher } from "./api/fetcher";

/**
 * 애플리케이션에서 사용할 기본 fetcher 인스턴스
 * 필요에 따라 다른 구현체로 교체할 수 있습니다.
 */
export const fetcher: Fetcher = new FetchApiFetcher();

/**
 * 특정 base URL을 가진 fetcher를 생성하는 팩토리 함수
 */
export const createFetcher = (baseUrl: string, defaultHeaders?: Record<string, string>): Fetcher => {
  return new FetchApiFetcher(baseUrl, defaultHeaders);
};
