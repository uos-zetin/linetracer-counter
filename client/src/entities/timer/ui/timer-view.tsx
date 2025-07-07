import { useTimerStore } from "../model";
import { formatMsToTime } from "./format-time";

export function TimerView() {
  const remainingTime = useTimerStore().useRemainingMs();
  const timerStatus = useTimerStore().useStatus();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold text-gray-800" title="Remaining Time">
        {formatMsToTime(remainingTime)}
      </span>
      <span className="text-gray-500">{timerStatus}</span>
    </div>
  );
}
