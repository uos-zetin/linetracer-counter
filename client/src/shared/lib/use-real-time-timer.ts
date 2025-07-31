import { useEffect, useRef, useState } from "react";

/**
 * 실시간 타이머 기본 훅 - 도메인 독립적인 순수한 타이머 로직
 * @param startedAt - 시작 시간 (timestamp)
 * @param stoppedAt - 정지 시간 (timestamp, null이면 실행 중)
 * @param calculateValue - 시작/정지/현재 시간을 받아서 표시할 값을 계산하는 함수
 * @returns 계산된 실시간 값
 */
export function useRealTimeTimer<T>(
  startedAt: number | null,
  stoppedAt: number | null,
  calculateValue: (startedAt: number | null, stoppedAt: number | null, now: number) => T
): T {
  const [value, setValue] = useState<T>(() => 
    calculateValue(startedAt, stoppedAt, Date.now())
  );
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const newValue = calculateValue(startedAt, stoppedAt, now);
      setValue(newValue);
      
      // 실행 중일 때만 계속 업데이트 (startedAt이 있고 stoppedAt이 없을 때)
      if (startedAt && !stoppedAt) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    if (startedAt) {
      frameRef.current = requestAnimationFrame(tick);
    } else {
      // startedAt이 없으면 초기값으로 설정
      setValue(calculateValue(startedAt, stoppedAt, Date.now()));
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [startedAt, stoppedAt, calculateValue]);

  return value;
}