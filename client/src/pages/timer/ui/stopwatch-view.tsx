import { formatElapsedMs, useStopwatchTimer } from "@/entities/counter";
import { useCounterService } from "@/features/counter";

export function StopwatchView() {
  const counterService = useCounterService();
  const stopwatch = counterService.useStopwatch();
  const elapsedTime = useStopwatchTimer(stopwatch.startedAt, stopwatch.stoppedAt);
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
