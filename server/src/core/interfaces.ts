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
