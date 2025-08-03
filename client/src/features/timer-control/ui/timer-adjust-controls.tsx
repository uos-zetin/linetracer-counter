import { useState } from "react";
import { useTimerControlService } from "../model/context";
import type { TimerLogType } from "@/entities/timer";

interface TimerAdjustControlsProps {
  participantId: string;
  disabled?: boolean;
  onAdjust?: (value: number) => void;
  className?: string;
}

export const TimerAdjustControls = ({
  participantId,
  disabled = false,
  onAdjust,
  className = "",
}: TimerAdjustControlsProps) => {
  const timerControlService = useTimerControlService();
  const [isLoading, setIsLoading] = useState(false);
  const [adjustValue, setAdjustValue] = useState<number>(1000); // Default 1 second

  const handleAdjust = async (value: number) => {
    setIsLoading(true);
    try {
      const { type, adjustValue }: { type: TimerLogType; adjustValue: number } =
        value < 0 ? { type: "sub", adjustValue: Math.abs(value) } : { type: "add", adjustValue: value };
      await timerControlService.adjustTimer(participantId, type, adjustValue);
      onAdjust?.(value);
    } catch (error) {
      console.error("Failed to adjust timer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const presetValues = [
    { label: "-10s", value: -10000 },
    { label: "-1s", value: -1000 },
    { label: "+1s", value: 1000 },
    { label: "+10s", value: 10000 },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Timer Adjustment</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={adjustValue}
            onChange={(e) => setAdjustValue(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={disabled || isLoading}
            step={100}
          />
          <span className="text-sm text-gray-600">ms</span>
          <button
            onClick={() => handleAdjust(adjustValue)}
            disabled={disabled || isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Adjusting..." : "Adjust"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Quick Adjust</label>
        <div className="flex space-x-2">
          {presetValues.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleAdjust(preset.value)}
              disabled={disabled || isLoading}
              className={`px-3 py-1 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                preset.value < 0
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
