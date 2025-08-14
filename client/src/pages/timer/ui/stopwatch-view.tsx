import { useParams } from "react-router";
import { formatElapsedMs, useStopwatchTimer } from "@/entities/counter";
import { useCounterService } from "@/features/counter";

export function StopwatchView() {
  const { counterId } = useParams();
  const counterService = useCounterService();
  const stopwatch = counterService.use.stopwatch(counterId || "");
  const elapsedTime = useStopwatchTimer(stopwatch.startedAt, stopwatch.stoppedAt);
  const timeComponents = formatElapsedMs(elapsedTime);

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
