import { useState } from "react";
import { useProgressService } from "@/features/progress";

interface DivisionControlSectionProps {
  className?: string;
}

export const DivisionControlSection = ({ 
  className = ""
}: DivisionControlSectionProps) => {
  const progressService = useProgressService();
  const [isLoading, setIsLoading] = useState(false);
  
  const division = progressService.useDivision();
  const nextRunners = progressService.useNextRunners();

  const handleOpenDivision = async () => {
    if (!division?.id) return;
    
    setIsLoading(true);
    try {
      await progressService.openDivision(division.id);
    } catch (error) {
      console.error("Failed to open division:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDivision = async () => {
    if (!division?.id) return;
    
    setIsLoading(true);
    try {
      await progressService.closeDivision(division.id);
    } catch (error) {
      console.error("Failed to close division:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDivision = async () => {
    if (!division?.id) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to reset division "${division.name}"? This will clear all progress.`
    );
    
    if (!confirmed) return;
    
    setIsLoading(true);
    try {
      await progressService.resetDivision(division.id);
    } catch (error) {
      console.error("Failed to reset division:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNextRunner = async () => {
    if (!division?.id || nextRunners.length === 0) return;
    
    setIsLoading(true);
    try {
      await progressService.setCurrentRunner(division.id, nextRunners[0].id);
    } catch (error) {
      console.error("Failed to set next runner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostponeRunner = async () => {
    if (!division?.id) return;
    
    setIsLoading(true);
    try {
      await progressService.postponeCurrentRunner(division.id);
    } catch (error) {
      console.error("Failed to postpone runner:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!division) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Division Control
        </h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No division connected</div>
          <div className="text-sm">Connect a counter to a division to control division state</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Division Control
      </h2>
      
      <div className="space-y-4">
        {/* Division Status */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Division Status</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Name: {division.name}</div>
            <div>Status: <span className="font-medium capitalize">{division.status}</span></div>
            <div>Next Runners: {nextRunners.length}</div>
          </div>
        </div>

        {/* Division State Controls */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Division State</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenDivision}
              disabled={isLoading || division.status === 'ongoing'}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Start Division"}
            </button>
            
            <button
              onClick={handleCloseDivision}
              disabled={isLoading || division.status === 'closed'}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "End Division"}
            </button>
          </div>
          
          <button
            onClick={handleResetDivision}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Division"}
          </button>
        </div>

        {/* Runner Controls */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Runner Management</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSetNextRunner}
              disabled={isLoading || nextRunners.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Next Runner"}
            </button>
            
            <button
              onClick={handlePostponeRunner}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : "Postpone"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};