import { useCounterService } from "../model/context";
import { formatElapsedMs } from "@/entities/counter";

interface CounterStatusDisplayProps {
  counterId: string;
  counterName?: string;
  divisionName?: string;
  className?: string;
}

export const CounterStatusDisplay = ({ 
  counterId, 
  counterName,
  divisionName,
  className = ""
}: CounterStatusDisplayProps) => {
  const counterService = useCounterService();

  const { startedAt, stoppedAt } = counterService.useStopwatch(counterId);
  const elapsedMs = counterService.getElapsedMs(counterId);
  
  const isRunning = startedAt !== null && stoppedAt === null;
  const isStopped = startedAt !== null && stoppedAt !== null;

  const getStatusColor = () => {
    if (isRunning) return "text-green-600";
    if (isStopped) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusText = () => {
    if (isRunning) return "Running";
    if (isStopped) return "Stopped";
    return "Ready";
  };

  const getBgColor = () => {
    if (isRunning) return "bg-green-50 border-green-200";
    if (isStopped) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className={`p-4 border rounded-lg ${getBgColor()} ${className}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {counterName || `Counter ${counterId}`}
          </h3>
          <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>
        
        {divisionName && (
          <div className="text-sm text-gray-600">
            Division: <span className="font-medium">{divisionName}</span>
          </div>
        )}
        
        <div className="text-2xl font-mono font-bold">
          {formatElapsedMs(elapsedMs).toString()}
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          {startedAt && (
            <div>Started: {new Date(startedAt).toLocaleTimeString()}</div>
          )}
          {stoppedAt && (
            <div>Stopped: {new Date(stoppedAt).toLocaleTimeString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};