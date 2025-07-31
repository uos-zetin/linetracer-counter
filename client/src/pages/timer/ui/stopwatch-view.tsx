import { formatElapsedMs } from "@/entities/counter";
import { useStopwatchTimer } from "@/shared";

type StopwatchViewProps = {
  startedAt: number | null;
  stoppedAt: number | null;
};

export function StopwatchView({ startedAt, stoppedAt }: StopwatchViewProps) {
  const elapsedTime = useStopwatchTimer(startedAt, stoppedAt);
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
