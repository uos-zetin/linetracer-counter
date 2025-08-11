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
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none font-bold text-foreground flex items-baseline">
        <span>{timeComponents.minutes}</span>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mx-1">:</span>
        <span>{timeComponents.seconds}</span>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">.</span>
        <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{timeComponents.milliseconds}</span>
      </div>
    </div>
  );
}
