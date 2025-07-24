/**
 * 스톱워치/랩 구간의 경과 시간(ms) 계산
 * @param counter 스톱워치/랩 상태
 * @param end 종료 시각(ms, 없으면 현재 시각)
 * @returns 경과 ms
 */
export function getElapsedMs(startedAt: number | null, stoppedAt: number | null): number {
  if (!startedAt) return 0;

  const start = startedAt;
  const stop = stoppedAt ?? Date.now();
  return Math.max(0, stop - start);
}

export function isRunning(startedAt: number | null, stoppedAt: number | null): boolean {
  return startedAt !== null && stoppedAt === null;
}
