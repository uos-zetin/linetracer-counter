import { useState } from "react";
import { useTimerControlService } from "../model/context";

interface TimerStartButtonProps {
  participantId: string;
  disabled?: boolean;
  onStart?: () => void;
  className?: string;
}

export const TimerStartButton = ({ 
  participantId, 
  disabled = false,
  onStart,
  className = ""
}: TimerStartButtonProps) => {
  const timerControlService = useTimerControlService();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await timerControlService.startTimer(participantId);
      onStart?.();
    } catch (error) {
      console.error("Failed to start timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={disabled || isLoading}
      className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Starting..." : "Start Timer"}
    </button>
  );
};