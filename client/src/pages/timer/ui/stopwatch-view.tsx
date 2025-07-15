import { getElapsedMs, formatElapsedMs } from "@/entities/stopwatch";

import type { StopwatchState } from "@/entities/stopwatch";
import { useEffect, useRef, useState } from "react";

type StopwatchViewProps = {
  stopwatch: StopwatchState;
};

export function StopwatchView({ stopwatch }: StopwatchViewProps) {
  const [elapsedMs, setElapsedMs] = useState(getElapsedMs(stopwatch));
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const elapsed = getElapsedMs(stopwatch, now);

      setElapsedMs(elapsed);
      if (elapsed > 0) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      startRef.current = null;
    };
  }, [stopwatch]);

  const timeComponents = formatElapsedMs(elapsedMs);

  return (
    <div className="flex flex-col items-center justify-center -mt-4">
      <div className="text-[9vw] leading-none font-bold text-gray-800 flex items-baseline">
        <span>{timeComponents.minutes}</span>
        <span className="transform -translate-y-[0.45vw]">:</span>
        <span>{timeComponents.seconds}</span>
        <span>.</span>
        <span>{timeComponents.milliseconds}</span>
      </div>
    </div>
  );
}
