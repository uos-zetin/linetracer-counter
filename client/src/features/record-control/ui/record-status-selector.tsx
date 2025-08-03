import { useState } from "react";
import { useRecordControlService } from "../model/context";
import type { RecordStatus } from "@/entities/record";

interface RecordStatusSelectorProps {
  recordId: string;
  currentStatus: RecordStatus;
  disabled?: boolean;
  onStatusChange?: (status: RecordStatus) => void;
  className?: string;
}

const statusOptions: { value: RecordStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  { value: "approved", label: "Approved", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "rejected", label: "Rejected", color: "text-red-600 bg-red-50 border-red-200" },
];

export const RecordStatusSelector = ({ 
  recordId, 
  currentStatus,
  disabled = false,
  onStatusChange,
  className = ""
}: RecordStatusSelectorProps) => {
  const recordControlService = useRecordControlService();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: RecordStatus) => {
    if (newStatus === currentStatus) return;
    
    setIsLoading(true);
    try {
      await recordControlService.updateRecordStatus(recordId, newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error("Failed to update record status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  };

  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Record Status
      </label>
      
      <div className="space-y-2">
        {/* Current Status Display */}
        <div className={`px-3 py-2 rounded-lg border ${currentStatusInfo.color}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Current: {currentStatusInfo.label}</span>
            {isLoading && (
              <div className="text-xs text-gray-500">Updating...</div>
            )}
          </div>
        </div>

        {/* Status Change Buttons */}
        <div className="flex space-x-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={disabled || isLoading || option.value === currentStatus}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                option.value === currentStatus
                  ? `${option.color} cursor-default`
                  : `hover:${option.color} border-gray-300 text-gray-700 hover:border-opacity-50`
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};