export interface CounterState {
  id: string; // 계수기 ID
  name: string; // 계수기 이름
  startedAt: number | null; // 계수기 시작 시간 (ms), null이면 계수기가 정지되어 있음
  stoppedAt: number | null; // 계수기 정지 시간 (ms), null이면 계수기가 시작되지 않았거나 아직 정지되지 않음
  divisionId: string | null; // 계수기가 속한 종목 ID
}

export interface CounterActions {
  init: (counterId: string, initialState: CounterState) => void; // 계수기 초기화
  start: (counterId: string, startedAt: number) => void; // 계수기 시작
  stop: (counterId: string, stoppedAt: number) => void; // 계수기 정지
  reset: (counterId: string) => void; // 계수기 리셋
  clearAll: () => void; // 모든 계수기 초기화 (테스트용)
}

export interface CounterGetters {
  getIsRunning: (counterId: string) => boolean; // 계수기가 실행 중인지 여부
  getElapsedMs: (counterId: string, now?: number) => number; // 경과 시간(ms) 계산
  getDivisionId: (counterId: string) => string | null; // 계수기가 속한 종목 ID 반환
}

export interface CounterStore extends CounterActions, CounterGetters {
  counters: Map<string, CounterState>; // 계수기 상태를 저장하는 맵
}
