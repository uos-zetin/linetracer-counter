import { getElapsedMs, formatElapsedMs } from "@/entities/counter";

import { useEffect, useRef, useState } from "react";

type StopwatchViewProps = {
  startedAt: number | null;
  stoppedAt: number | null;
};

export function StopwatchView({ startedAt, stoppedAt }: StopwatchViewProps) {
  const [elapsedTime, setElapsedTime] = useState(getElapsedMs(startedAt, stoppedAt ?? Date.now()));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();

      const newElapsedTime = getElapsedMs(startedAt, now);
      setElapsedTime(newElapsedTime);
      if (newElapsedTime > 0) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [startedAt]);

  const timeComponents = formatElapsedMs(elapsedTime);

  return (
    <div className="flex flex-col items-center justify-center">
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
