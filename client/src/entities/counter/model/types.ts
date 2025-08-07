import type { BaseEntityActions } from "@/shared/lib";

export interface CounterState {
  id: string; // 계수기 ID
  name: string; // 계수기 이름
  startedAt: number | null; // 계수기 시작 시간 (ms), null이면 계수기가 정지되어 있음
  stoppedAt: number | null; // 계수기 정지 시간 (ms), null이면 계수기가 시작되지 않았거나 아직 정지되지 않음
  divisionId: string | null; // 계수기가 속한 종목 ID
}

export interface CounterActions extends BaseEntityActions<CounterState> {
  start: (counterId: string, startedAt: number) => void; // 계수기 시작
  stop: (counterId: string, stoppedAt: number) => void; // 계수기 정지
  reset: (counterId: string) => void; // 계수기 리셋
}

export interface CounterStore extends CounterActions {
  counters: CounterState[]; // 계수기 상태 목록
}
