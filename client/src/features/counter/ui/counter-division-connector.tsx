import { useState } from "react";
import { useCounterService } from "../model/context";

interface Division {
  id: string;
  name: string;
}

interface CounterDivisionConnectorProps {
  counterId: string;
  currentDivisionId: string | null;
  availableDivisions: Division[];
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const CounterDivisionConnector = ({ 
  counterId, 
  currentDivisionId, 
  availableDivisions,
  onConnect,
  onDisconnect 
}: CounterDivisionConnectorProps) => {
  const counterService = useCounterService();
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (!selectedDivisionId) return;
    
    setIsLoading(true);
    try {
      await counterService.connectDivision(counterId, selectedDivisionId);
      setSelectedDivisionId("");
      onConnect?.();
    } catch (error) {
      console.error("Failed to connect division:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await counterService.disconnectDivision(counterId);
      onDisconnect?.();
    } catch (error) {
      console.error("Failed to disconnect division:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentDivision = availableDivisions.find(d => d.id === currentDivisionId);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Division Connection</h3>
      
      {currentDivisionId ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Connected to:</span>
            <span className="font-medium text-green-600">
              {currentDivision?.name || currentDivisionId}
            </span>
          </div>
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Disconnecting..." : "Disconnect Division"}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <select
              value={selectedDivisionId}
              onChange={(e) => setSelectedDivisionId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">Select a division...</option>
              {availableDivisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleConnect}
              disabled={!selectedDivisionId || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Connecting..." : "Connect"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};