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

export type CounterDeviceEvent =
  | { type: "start"; startedAt: number }
  | { type: "stop"; startedAt: number; stoppedAt: number } // 출발 신호가 유효한 상태에서 도착 이벤트가 발생한다.
  | { type: "reset" };

export type CounterDeviceStatus = {
  startedAt: number | null;
  stoppedAt: number | null;
};

/**
 * 계수기 디바이스의 상태를 관리하며 이벤트를 발생시키는 인터페이스이다.
 */
export interface CounterDevice {
  readonly deviceId: string;
  readonly name: string;

  /**
   * 계수기 디바이스에서 다음의 이벤트를 발생시킨다.
   *
   * - 출발 신호 이벤트를 발생시킨다.
   *     - 이때 어떠한 상태에 출발 신호 이벤트를 발생시킬 지는 구현체에서 결정할 일이다.
   *     - 출발 신호 이벤트에는 출발 시간을 포함한다.
   * - 도착 신호 이벤트를 발생시킨다.
   *     - 이때 어떠한 상태에 도착 신호 이벤트를 발생시킬 지는 구현체에서 결정할 일이다.
   *     - 도착 신호 이벤트에는 출발 시간, 도착 시간을 포함한다.
   * - 초기화 이벤트를 발생시킨다.
   *     - `reset` 메서드를 호출하거나 계수기 디바이스 상에서 초기화 액션이 수행될 경우 발생한다.
   */
  subscribe(
    callback: (event: CounterDeviceEvent) => Promise<void>
  ): Unsubscriber;

  /**
   * 계수기 디바이스의 상태를 반환한다.
   */
  getStatus(): Promise<CounterDeviceStatus>;

  /**
   * 계수기 디바이스를 초기화한다.
   */
  reset(): Promise<void>;
}

/**
 * 계수기 디바이스 인스턴스들을 관리하는 레지스트리 인터페이스이다.
 *
 * 설계 원칙:
 * - 등록된 계수기 디바이스 인스턴스들을 조회, 등록 해제, 이벤트 구독 기능만 제공한다.
 * - 계수기 디바이스 등록은 구현체별로 다르므로 인터페이스에서 제외한다.
 * - 서비스 레이어는 이 인터페이스를 통해 등록된 계수기 디바이스에 접근할 수 있다.
 * - 실제 구현체에서는 계수기 디바이스를 등록하고 데이터를 받아 처리하는 로직을 구현한다.
 */
export interface CounterDeviceRegistry {
  /**
   * 등록된 모든 계수기 디바이스 인스턴스를 반환한다.
   */
  getCounterDevices(): Promise<CounterDevice[]>;

  /**
   * 계수기 디바이스 ID를 통해 등록된 계수기 디바이스 인스턴스를 반환한다.
   * 해당 계수기 디바이스 ID에 등록된 계수기 디바이스가 없으면 CounterNotRegisteredError를 던진다.
   */
  getCounterDevice(deviceId: string): Promise<CounterDevice>;

  /**
   * 특정 계수기 디바이스를 등록 해제한다.
   */
  unregisterCounterDevice(deviceId: string): Promise<void>;

  /**
   * 특정 계수기 디바이스의 이벤트를 구독한다.
   *
   * - 특정 계수기 디바이스에서 발생하는 이벤트를 그대로 전달한다.
   * - 등록되지 않은 계수기 디바이스라도 구독할 수 있으며, 그러한 경우에는 아무 이벤트도 발생하지 않을 것이다.
   */
  subscribeCounterDeviceEvent(
    deviceId: string,
    callback: (event: CounterDeviceEvent) => Promise<void>
  ): Unsubscriber;
}
