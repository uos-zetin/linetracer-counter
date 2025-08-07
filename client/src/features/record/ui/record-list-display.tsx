import { formatDateTime } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { formatElapsedMs } from "@/entities/counter";
import type { Record, RecordStatus } from "@/entities/record";
import { useRecordService } from "../model/context";

interface RecordListDisplayProps {
  participantId?: string;
  filterByStatus?: RecordStatus;
  showParticipantInfo?: boolean;
  onRecordSelect?: (record: Record) => void;
  className?: string;
}

export const RecordListDisplay = ({
  participantId,
  filterByStatus,
  showParticipantInfo = false,
  onRecordSelect,
  className = "",
}: RecordListDisplayProps) => {
  const recordService = useRecordService();
  const allRecords = recordService.use.records();

  const getFilteredRecords = (): Record[] => {
    let records = allRecords;

    if (participantId) {
      records = recordService.filter.byParticipant(participantId);
    }

    if (filterByStatus) {
      records = recordService.filter.byStatus(filterByStatus);
    }

    // Sort by creation date (newest first)
    return records.sort((a: Record, b: Record) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const getStatusColor = (status: RecordStatus) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "pending":
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getSourceIcon = (source: Record["source"]) => {
    switch (source) {
      case "stopwatch":
        return "⏱️";
      case "manual":
        return "✏️";
      case "other":
      default:
        return "📝";
    }
  };

  const filteredRecords = getFilteredRecords();

  if (filteredRecords.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-lg mb-2">No records found</div>
        <div className="text-sm">
          {participantId && filterByStatus
            ? `No ${filterByStatus} records for this participant`
            : participantId
              ? "No records for this participant"
              : filterByStatus
                ? `No ${filterByStatus} records`
                : "No records available"}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Records ({filteredRecords.length})</h3>
        {filterByStatus && (
          <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(filterByStatus)}`}>
            {filterByStatus.charAt(0).toUpperCase() + filterByStatus.slice(1)}
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredRecords.map((record) => {
          const RecordWrapper = onRecordSelect ? Button : "div";
          const wrapperProps = onRecordSelect
            ? {
                variant: "ghost" as const,
                className: "h-auto p-4 justify-start text-left border rounded-lg w-full",
                onClick: () => onRecordSelect(record),
              }
            : {
                className: "p-4 border rounded-lg",
              };

          return (
            <RecordWrapper key={record.id} {...wrapperProps}>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-mono font-bold">{formatElapsedMs(record.value).toString()}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSourceIcon(record.source)}</span>
                      <span className="text-sm text-gray-600 capitalize">{record.source}</span>
                    </div>
                  </div>

                  {showParticipantInfo && (
                    <div className="text-sm text-gray-600">Participant ID: {record.participantId}</div>
                  )}

                  {record.note && <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{record.note}</div>}

                  <div className="text-xs text-gray-500">Created: {formatDateTime(record.createdAt)}</div>
                </div>

                <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
              </div>
            </RecordWrapper>
          );
        })}
      </div>
    </div>
  );
};
