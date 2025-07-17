export interface StopwatchState {
  startedAt: number | null; // 타이머 시작 시간 (ms), null이면 타이머가 정지되어 있음
  stoppedAt: number | null; // 타이머 정지 시간 (ms), null이면 타이머가 시작되지 않았거나 아직 정지되지 않음
}

export interface StopwatchStore {
  init: (startedAt: number | null, stoppedAt: number | null) => void; // 타이머 초기화
  start: (current: number) => void; // 타이머 시작
  stop: (current: number) => void; // 타이머 정지
  reset: () => void; // 타이머 초기화
  useStopwatchState: () => StopwatchState; // 현재 타이머 상태 가져오기
}
