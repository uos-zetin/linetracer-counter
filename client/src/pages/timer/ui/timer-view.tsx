import { formatMsToTime, integrateLogs, useCountdownTimer } from "@/entities/timer";
import { useProgressService } from "@/features/progress";

export function TimerView() {
  const progress = useProgressService();
  const currentDivision = progress.use.division();
  const currentRunner = progress.use.runner();
  const timerLogs = currentRunner?.timerLogs || [];
  const timerState = integrateLogs((currentDivision?.timeLimit || 0) * 1000, timerLogs);

  const remainingTime = useCountdownTimer(timerState);
  const timeComponents = formatMsToTime(remainingTime);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] leading-none font-bold text-foreground flex items-center">
        <span>{timeComponents.hours}</span>
        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[8rem] mx-1">:</span>
        <span>{timeComponents.minutes}</span>
        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[8rem] mx-1">:</span>
        <span>{timeComponents.seconds}</span>
      </div>
    </div>
  );
}
