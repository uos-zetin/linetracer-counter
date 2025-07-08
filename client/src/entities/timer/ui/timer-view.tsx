import { formatMsToTime } from "./format-time";

type TimerViewProps = {
  remainingMs: number;
  timerStatus: "running" | "stopped" | "finished";
};

export function TimerView({ remainingMs, timerStatus }: TimerViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold text-gray-800" title="Remaining Time">
        {formatMsToTime(remainingMs)}
      </span>
      <span className="text-gray-500">{timerStatus}</span>
    </div>
  );
}
