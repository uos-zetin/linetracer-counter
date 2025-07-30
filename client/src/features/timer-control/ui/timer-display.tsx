import { useEffect, useState } from "react";
import { formatElapsedMs } from "@/entities/counter";

interface TimerDisplayProps {
  participantId: string;
  participantName?: string;
  initialMs?: number;
  offsetMs?: number;
  accumulatedMs?: number;
  startedAt?: number | null;
  className?: string;
}

export const TimerDisplay = ({ 
  participantId,
  participantName,
  initialMs = 0,
  offsetMs = 0,
  accumulatedMs = 0,
  startedAt = null,
  className = ""
}: TimerDisplayProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (startedAt === null) return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, [startedAt]);

  const calculateCurrentMs = () => {
    if (startedAt === null) {
      // Timer is stopped
      return initialMs + offsetMs + accumulatedMs;
    } else {
      // Timer is running
      const runningMs = currentTime - startedAt;
      return initialMs + offsetMs + accumulatedMs + runningMs;
    }
  };

  const currentMs = calculateCurrentMs();
  const isRunning = startedAt !== null;

  const getStatusColor = () => {
    if (isRunning) return "text-green-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (isRunning) return "Running";
    return "Stopped";
  };

  const getBgColor = () => {
    if (isRunning) return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className={`p-4 border rounded-lg ${getBgColor()} ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {participantName || `Participant ${participantId}`}
          </h3>
          <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
        
        <div className="text-3xl font-mono font-bold">
          {formatElapsedMs(currentMs).toString()}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <div>Initial: {formatElapsedMs(initialMs).toString()}</div>
          {offsetMs !== 0 && (
            <div>
              Offset: {offsetMs >= 0 ? "+" : ""}{formatElapsedMs(Math.abs(offsetMs)).toString()}
            </div>
          )}
          {accumulatedMs > 0 && (
            <div>Accumulated: {formatElapsedMs(accumulatedMs).toString()}</div>
          )}
          {startedAt && (
            <div>Started: {new Date(startedAt).toLocaleTimeString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};