import { RecordStatusSelector, RecordNoteEditor, RecordListDisplay, useRecordControlService } from "@/features/record-control";
import { useProgressService } from "@/features/progress";
import { useState } from "react";
import type { Record } from "@/entities/record";

interface RecordControlSectionProps {
  className?: string;
}

export const RecordControlSection = ({ 
  className = ""
}: RecordControlSectionProps) => {
  const recordControlService = useRecordControlService();
  const progressService = useProgressService();
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  
  const currentRunner = progressService.useRunner();
  const participantId = currentRunner?.participant.id;

  if (!participantId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Record Control
        </h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No active runner</div>
          <div className="text-sm">Connect a division and set a current runner to manage records</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Record Control
      </h2>
      
      <div className="space-y-4">
        {/* Current Runner's Records */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">
            {currentRunner.participant.name}'s Records
          </h3>
          
          <RecordListDisplay
            participantId={participantId}
            onRecordSelect={setSelectedRecord}
            className="max-h-64"
          />
        </div>

        {/* Record Editor (when record is selected) */}
        {selectedRecord && (
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-medium text-gray-900">
              Edit Selected Record
            </h3>
            
            <RecordStatusSelector
              recordId={selectedRecord.id}
              currentStatus={selectedRecord.status}
              onStatusChange={() => {
                // Refresh record data
                setSelectedRecord(null);
              }}
            />
            
            <RecordNoteEditor
              recordId={selectedRecord.id}
              currentNote={selectedRecord.note}
              onNoteChange={() => {
                // Refresh record data
                setSelectedRecord(null);
              }}
            />
            
            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              Close Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};