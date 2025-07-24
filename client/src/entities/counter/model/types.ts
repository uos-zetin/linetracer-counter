export interface CounterState {
  id: string; // 계수기 ID
  name: string; // 계수기 이름
  startedAt: number | null; // 계수기 시작 시간 (ms), null이면 계수기가 정지되어 있음
  stoppedAt: number | null; // 계수기 정지 시간 (ms), null이면 계수기가 시작되지 않았거나 아직 정지되지 않음
  divisionId: string | null; // 계수기가 속한 종목 ID
}

export interface CounterActions {
  init: (initialState: CounterState) => void; // 계수기 초기화
  start: (startedAt: number) => void; // 계수기 시작
  stop: (stoppedAt: number) => void; // 계수기 정지
  reset: () => void; // 계수기 리셋
}

export interface CounterGetters {
  getIsRunning: () => boolean; // 계수기가 실행 중인지 여부
  getElapsedMs: (now?: number) => number; // 경과 시간(ms) 계산
  getDivisionId: () => string | null; // 계수기가 속한 종목 ID 반환
}

export type CounterStore = CounterState & CounterActions & CounterGetters;
