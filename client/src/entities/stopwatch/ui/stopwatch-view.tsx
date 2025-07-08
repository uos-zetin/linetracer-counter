import { formatElapsedMs } from "./format";

type StopwatchViewProps = {
  elapsedMs: number;
  isRunning: boolean;
};

export function StopwatchView({ elapsedMs, isRunning }: StopwatchViewProps) {
  const formattedTime = formatElapsedMs(elapsedMs);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold text-gray-800" title="Elapsed Time">
        {formattedTime}
      </span>
      <span className="text-sm text-gray-500">{isRunning ? "Running" : "Stopped"}</span>
    </div>
  );
}
