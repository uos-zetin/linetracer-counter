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
      <div className={`text-center py-6 sm:py-8 text-gray-500 ${className}`}>
        <div className="text-base sm:text-lg mb-2">No records found</div>
        <div className="text-xs sm:text-sm px-4">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-semibold">Records ({filteredRecords.length})</h3>
        {filterByStatus && (
          <div className={`px-2 py-1 rounded text-xs sm:text-sm font-medium w-fit ${getStatusColor(filterByStatus)}`}>
            {filterByStatus.charAt(0).toUpperCase() + filterByStatus.slice(1)}
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredRecords.map((record) => {
          const recordContent = (
            <div className="space-y-3">
              {/* Top row: Time and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-all">
                  {formatElapsedMs(record.value).toString()}
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap w-fit ${getStatusColor(record.status)}`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </div>
              </div>

              {/* Source info */}
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg">{getSourceIcon(record.source)}</span>
                <span className="text-xs sm:text-sm text-gray-600 capitalize">{record.source}</span>
              </div>

              {/* Participant info if enabled */}
              {showParticipantInfo && (
                <div className="text-xs sm:text-sm text-gray-600 break-words">
                  <span className="hidden sm:inline">Participant ID: </span>
                  <span className="sm:hidden">ID: </span>
                  <span>{record.participantId}</span>
                </div>
              )}

              {/* Note if exists */}
              {record.note && (
                <div className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-2 sm:p-3 rounded leading-relaxed break-words overflow-hidden">
                  {record.note}
                </div>
              )}

              {/* Created date */}
              <div className="text-xs text-gray-500">
                <span className="hidden sm:inline">Created: </span>
                {formatDateTime(record.createdAt)}
              </div>
            </div>
          );

          return onRecordSelect ? (
            <Button
              key={record.id}
              variant="ghost"
              className="h-auto p-3 sm:p-4 justify-start text-left border rounded-lg w-full overflow-hidden"
              onClick={() => onRecordSelect(record)}
            >
              {recordContent}
            </Button>
          ) : (
            <div key={record.id} className="p-3 sm:p-4 border rounded-lg overflow-hidden">
              {recordContent}
            </div>
          );
        })}
      </div>
    </div>
  );
};
