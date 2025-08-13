import { useState } from "react";
import { Button, Badge } from "@/shared/ui";
import type { RecordStatus } from "@/entities/record";
import { useRecordService } from "../model/context";

interface RecordStatusSelectorProps {
  recordId: string;
  currentStatus: RecordStatus;
  disabled?: boolean;
  onStatusChange?: (status: RecordStatus) => void;
  className?: string;
}

const statusOptions: { value: RecordStatus; label: string; variant: "default" | "secondary" | "destructive" }[] = [
  { value: "pending", label: "Pending", variant: "secondary" },
  { value: "approved", label: "Approved", variant: "default" },
  { value: "rejected", label: "Rejected", variant: "destructive" },
];

export const RecordStatusSelector = ({
  recordId,
  currentStatus,
  disabled = false,
  onStatusChange,
  className = "",
}: RecordStatusSelectorProps) => {
  const recordService = useRecordService();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (newStatus: RecordStatus) => {
    if (newStatus === currentStatus) return;

    setIsLoading(true);
    try {
      await recordService.admin.updateStatus(recordId, newStatus);
      onStatusChange?.(newStatus);
    } catch (error) {
      console.error("Failed to update record status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentStatusInfo = () => {
    return statusOptions.find((option) => option.value === currentStatus) || statusOptions[0];
  };

  const currentStatusInfo = getCurrentStatusInfo();

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-foreground">Record Status</label>

      <div className="space-y-2">
        {/* Current Status Display */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Current:</span>
            <Badge variant={currentStatusInfo.variant}>{currentStatusInfo.label}</Badge>
          </div>
          {isLoading && <div className="text-xs text-muted-foreground">Updating...</div>}
        </div>

        {/* Status Change Buttons */}
        <div className="flex space-x-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={option.value === currentStatus ? option.variant : "outline"}
              size="sm"
              onClick={() => handleStatusChange(option.value)}
              disabled={disabled || isLoading || option.value === currentStatus}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
