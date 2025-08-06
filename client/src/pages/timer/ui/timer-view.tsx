import { formatMsToTime, integrateLogs, useCountdownTimer } from "@/entities/timer";
import { useProgressService } from "@/features/progress";

export function TimerView() {
  const progress = useProgressService();
  const currentDivision = progress.useDivision();
  const currentRunner = progress.useRunner();
  const timerLogs = currentRunner?.timerLogs || [];
  const timerState = integrateLogs(currentDivision?.timeLimit || 0, timerLogs);

  const remainingTime = useCountdownTimer(timerState);
  const timeComponents = formatMsToTime(remainingTime);

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
