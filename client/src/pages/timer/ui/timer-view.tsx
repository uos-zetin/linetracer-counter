import { formatMsToTime } from "@/entities/timer";
import { useCountdownTimer } from "@/shared";
import type { TimerState } from "@/entities/timer";

export function TimerView({ timerState }: { timerState: TimerState }) {
  const remainingMs = useCountdownTimer(timerState);
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
