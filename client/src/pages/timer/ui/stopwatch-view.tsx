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
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] leading-none font-bold text-foreground flex items-baseline">
        <div className="flex items-center">
          <span>{timeComponents.minutes}</span>
          <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[8rem] mx-1">:</span>
          <span>{timeComponents.seconds}</span>
        </div>
        <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[8rem]">.</span>
        <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[6rem]">{timeComponents.milliseconds}</span>
      </div>
    </div>
  );
}
