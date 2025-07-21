import { Actor } from "./models";

export type Unsubscriber = () => void;

export interface ActorSessionStore {
  /**
   * 액터 세션을 생성할 수 있다.
   */
  createSession(actor: Actor, expiresMsIn: number): Promise<string>;

  /**
   * 세션 키가 유효하면 Actor 모델을 반환한다. 그렇지 않으면 AuthenticationError를 던진다.
   */
  validateSession(key: string): Promise<Actor>;

  /**
   * 세션 키로 액터 세션을 폐기할 수 있다.
   */
  revokeSession(key: string): Promise<void>;
}

export interface DivisionProgressState {
  runnerId: string | null; // 현재 경연자 ID
  participantOrder: string[]; // 경연 순번에 따른 참가자 ID 목록
}

export interface DivisionProgressStateStore {
  /**
   * 대회 부문의 진행 상태를 초기화한다.
   * ```ts
   * {
   *   runnerId: null,
   *   participantOrder: [],
   * }
   * ```
   */
  resetState(divisionId: string): Promise<void>;

  /**
   * 대회 부문의 진행 상태를 설정한다.
   */
  setState(divisionId: string, state: DivisionProgressState): Promise<void>;

  /**
   * 대회 부문의 진행 상태를 조회한다. 설정된 상태가 없으면 `reset`시 수행되는 기본값을 반환한다.
   */
  getState(divisionId: string): Promise<DivisionProgressState>;
}
