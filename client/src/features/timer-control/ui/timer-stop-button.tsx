import { useState } from "react";
import { useTimerControlService } from "../model/context";

interface TimerStopButtonProps {
  participantId: string;
  disabled?: boolean;
  onStop?: () => void;
  className?: string;
}

export const TimerStopButton = ({ 
  participantId, 
  disabled = false,
  onStop,
  className = ""
}: TimerStopButtonProps) => {
  const timerControlService = useTimerControlService();
  const [isLoading, setIsLoading] = useState(false);

  const handleStop = async () => {
    setIsLoading(true);
    try {
      await timerControlService.stopTimer(participantId);
      onStop?.();
    } catch (error) {
      console.error("Failed to stop timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStop}
      disabled={disabled || isLoading}
      className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Stopping..." : "Stop Timer"}
    </button>
  );
};