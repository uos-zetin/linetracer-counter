import { formatMsToTime } from "./format-time";

export function TimerView(remainingMs: number, timerStatus: "running" | "stopped" | "finished") {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold text-gray-800" title="Remaining Time">
        {formatMsToTime(remainingMs)}
      </span>
      <span className="text-gray-500">{timerStatus}</span>
    </div>
  );
}
