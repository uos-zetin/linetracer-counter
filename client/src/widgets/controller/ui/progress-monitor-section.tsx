import { useProgressService } from "@/features/progress";
import { formatElapsedMs } from "@/entities/counter";

interface ProgressMonitorSectionProps {
  className?: string;
}

export const ProgressMonitorSection = ({ 
  className = ""
}: ProgressMonitorSectionProps) => {
  const progressService = useProgressService();
  
  const competition = progressService.useCompetition();
  const division = progressService.useDivision();
  const currentRunner = progressService.useRunner();
  const nextRunners = progressService.useNextRunners();
  const topRecords = progressService.useTopRecords();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Progress Monitor
      </h2>
      
      <div className="space-y-4">
        {/* Competition & Division Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Competition Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Competition: {competition?.name || "Not connected"}</div>
            <div>Division: {division?.name || "Not connected"}</div>
            <div>Status: {division?.status || "Unknown"}</div>
          </div>
        </div>

        {/* Current Runner */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Current Runner</h3>
          {currentRunner ? (
            <div className="text-sm text-blue-800 space-y-1">
              <div className="font-medium">{currentRunner.participant.name}</div>
              <div>Team: {currentRunner.participant.teamName}</div>
              <div>Robot: {currentRunner.participant.robotName}</div>
              <div>Records: {currentRunner.records.length}</div>
              <div>Manual Records: {currentRunner.manualRecords.length}</div>
            </div>
          ) : (
            <div className="text-sm text-blue-600">No current runner</div>
          )}
        </div>

        {/* Next Runners */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-900 mb-2">Next Runners ({nextRunners.length})</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {nextRunners.slice(0, 5).map((runner, index) => (
              <div key={runner.id} className="text-sm text-yellow-800">
                {index + 1}. {runner.name} ({runner.teamName})
              </div>
            ))}
            {nextRunners.length > 5 && (
              <div className="text-sm text-yellow-600">
                ... and {nextRunners.length - 5} more
              </div>
            )}
          </div>
        </div>

        {/* Top Records */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900 mb-2">Top Records</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {topRecords.slice(0, 5).map((record, index) => (
              <div key={record.id} className="text-sm text-green-800 flex justify-between">
                <span>{index + 1}. {record.participantId}</span>
                <span className="font-mono">{formatElapsedMs(record.value).toString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};