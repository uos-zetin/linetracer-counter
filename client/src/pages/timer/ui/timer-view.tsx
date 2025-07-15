import { useEffect, useRef, useState } from "react";

import { getRemainingMs, formatMsToTime } from "@/features/timer";

import type { TimerState } from "@/features/timer";

export function TimerView({ timerState }: { timerState: TimerState }) {
  const [remainingMs, setRemainingMs] = useState(timerState.initialMs);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const elapsed = getRemainingMs(timerState, now);

      setRemainingMs(elapsed);
      if (elapsed > 0) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      startRef.current = null;
    };
  }, [timerState]);

  const timeComponents = formatMsToTime(remainingMs);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-[9vw] leading-none font-bold text-gray-800 flex items-baseline">
        <span>{timeComponents.hours}</span>
        <span className="transform -translate-y-[0.45vw]">:</span>
        <span>{timeComponents.minutes}</span>
        <span className="transform -translate-y-[0.45vw]">:</span>
        <span>{timeComponents.seconds}</span>
      </div>
    </div>
  );
}
