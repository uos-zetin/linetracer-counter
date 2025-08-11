import { formatMsToTime, integrateLogs, useCountdownTimer } from "@/entities/timer";
import { useProgressService } from "@/features/progress";

export function TimerView() {
  const progress = useProgressService();
  const currentDivision = progress.use.division();
  const currentRunner = progress.use.runner();
  const timerLogs = currentRunner?.timerLogs || [];
  const timerState = integrateLogs(currentDivision?.timeLimit || 0, timerLogs);

  const remainingTime = useCountdownTimer(timerState);
  const timeComponents = formatMsToTime(remainingTime);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none font-bold text-foreground flex items-baseline">
        <span>{timeComponents.hours}</span>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mx-1">:</span>
        <span>{timeComponents.minutes}</span>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mx-1">:</span>
        <span>{timeComponents.seconds}</span>
      </div>
    </div>
  );
}
