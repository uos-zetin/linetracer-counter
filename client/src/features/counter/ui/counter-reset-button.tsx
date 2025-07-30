import { useState } from "react";
import { useCounterService } from "../model/context";

interface CounterResetButtonProps {
  counterId: string;
  disabled?: boolean;
  onReset?: () => void;
  className?: string;
}

export const CounterResetButton = ({ 
  counterId, 
  disabled = false,
  onReset,
  className = ""
}: CounterResetButtonProps) => {
  const counterService = useCounterService();
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await counterService.reset(counterId);
      onReset?.();
    } catch (error) {
      console.error("Failed to reset counter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={disabled || isLoading}
      className={`px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? "Resetting..." : "Reset Counter"}
    </button>
  );
};