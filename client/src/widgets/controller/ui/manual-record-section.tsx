import { useState } from "react";
import { useProgressService } from "@/features/progress";
import { useRecordControlService } from "@/features/record-control";
import { formatElapsedMs } from "@/entities/counter";
import type { ManualRecord } from "@/entities/manual-record";

interface ManualRecordSectionProps {
  className?: string;
}

export const ManualRecordSection = ({ 
  className = ""
}: ManualRecordSectionProps) => {
  const progressService = useProgressService();
  const recordControlService = useRecordControlService();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  
  const currentRunner = progressService.useRunner();
  const manualRecords = currentRunner?.manualRecords || [];

  const handleRecordSelect = (recordId: string, selected: boolean) => {
    const newSelected = new Set(selectedRecords);
    if (selected) {
      newSelected.add(recordId);
    } else {
      newSelected.delete(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    const validRecordIds = manualRecords
      .filter(record => !record.invalidatedAt)
      .map(record => record.id);
    setSelectedRecords(new Set(validRecordIds));
  };

  const handleClearSelection = () => {
    setSelectedRecords(new Set());
  };

  const calculateMedianTime = (records: ManualRecord[]) => {
    if (records.length === 0) return 0;
    
    const sortedValues = records.map(r => r.value).sort((a, b) => a - b);
    const length = sortedValues.length;
    
    if (length % 2 === 1) {
      // 홀수 개: 중앙값
      return sortedValues[Math.floor(length / 2)];
    } else {
      // 짝수 개: 중앙 2개의 평균
      const mid1 = sortedValues[length / 2 - 1];
      const mid2 = sortedValues[length / 2];
      return Math.round((mid1 + mid2) / 2);
    }
  };

  const handleCreateRecord = async () => {
    if (!currentRunner?.participant.id || selectedRecords.size === 0) return;
    
    const selectedManualRecords = manualRecords.filter(record => 
      selectedRecords.has(record.id) && !record.invalidatedAt
    );
    
    if (selectedManualRecords.length === 0) {
      alert("No valid manual records selected");
      return;
    }
    
    const medianTime = calculateMedianTime(selectedManualRecords);
    const note = `Created from ${selectedManualRecords.length} manual records (median) by: ${
      [...new Set(selectedManualRecords.map(r => r.recorderName))].join(", ")
    }`;
    
    setIsLoading(true);
    try {
      await recordControlService.createRecord(currentRunner.participant.id, {
        value: medianTime,
        source: "manual",
        note: note
      });
      setSelectedRecords(new Set());
      alert("Record created successfully!");
    } catch (error) {
      console.error("Failed to create record:", error);
      alert("Failed to create record");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentRunner) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Manual Record Review
        </h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No active runner</div>
          <div className="text-sm">Connect a division and set a current runner to review manual records</div>
        </div>
      </div>
    );
  }

  const validRecords = manualRecords.filter(record => !record.invalidatedAt);
  const selectedValidRecords = validRecords.filter(record => selectedRecords.has(record.id));

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibent mb-4 text-gray-800">
        Manual Record Review
      </h2>
      
      <div className="space-y-4">
        {/* Current Runner Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Current Runner</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div className="font-medium">{currentRunner.participant.name}</div>
            <div>Team: {currentRunner.participant.teamName}</div>
            <div>Manual Records: {validRecords.length} valid, {manualRecords.length - validRecords.length} invalidated</div>
          </div>
        </div>

        {/* Manual Records List */}
        {validRecords.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">Manual Records from Manual Counter</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearSelection}
                  disabled={isLoading}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg max-h-64 overflow-y-auto">
              {validRecords
                .sort((a, b) => a.value - b.value) // Sort by time for easier median understanding
                .map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedRecords.has(record.id)}
                        onChange={(e) => handleRecordSelect(record.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={isLoading}
                      />
                      <div className="text-sm">
                        <div className="font-mono font-medium">
                          #{index + 1} {formatElapsedMs(record.value).toString()}
                        </div>
                        <div className="text-gray-600">
                          by {record.recorderName} at {record.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Summary and Create Record */}
            {selectedValidRecords.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Selected Records Summary</h4>
                <div className="text-sm text-green-800 space-y-1 mb-3">
                  <div>Count: {selectedValidRecords.length} records</div>
                  <div>Median Time: <span className="font-mono font-medium">
                    {formatElapsedMs(calculateMedianTime(selectedValidRecords)).toString()}
                  </span></div>
                  {selectedValidRecords.length > 1 && (
                    <div className="text-xs text-green-600">
                      {selectedValidRecords.length % 2 === 1 
                        ? "Middle value of sorted times" 
                        : "Average of middle two values"
                      }
                    </div>
                  )}
                  <div>Recorders: {[...new Set(selectedValidRecords.map(r => r.recorderName))].join(", ")}</div>
                </div>
                
                <button
                  onClick={handleCreateRecord}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Record..." : "Create Official Record (Median)"}
                </button>
              </div>
            )}

            {selectedRecords.size > 0 && selectedValidRecords.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                No valid records selected
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No manual records</div>
            <div className="text-sm">Manual records will appear here when created from manual counter pages</div>
          </div>
        )}
      </div>
    </div>
  );
};