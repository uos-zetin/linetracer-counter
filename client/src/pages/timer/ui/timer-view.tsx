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
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="leading-none font-bold text-foreground flex items-baseline" style={{ fontSize: "10vh" }}>
        <div className="flex items-center">
          <span>{timeComponents.minutes}</span>
          <span className="mx-1" style={{ fontSize: "7vh" }}>
            :
          </span>
          <span>{timeComponents.seconds}</span>
        </div>
        <span style={{ fontSize: "7vh" }}>.</span>
        <span style={{ fontSize: "7vh" }}>{timeComponents.milliseconds}</span>
      </div>
    </div>
  );
}
