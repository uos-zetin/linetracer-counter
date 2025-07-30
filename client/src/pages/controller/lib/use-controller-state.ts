import { useEffect, useState } from "react";
import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";

interface ControllerStateHook {
  isConnecting: boolean;
  connectionError: string | null;
  counterConnected: boolean;
  progressConnected: boolean;
  currentDivisionId: string | null;
}

export const useControllerState = (counterId: string | null): ControllerStateHook => {
  const counterService = useCounterService();
  const progressService = useProgressService();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [counterConnected, setCounterConnected] = useState(false);
  const [progressConnected, setProgressConnected] = useState(false);
  const [currentDivisionId, setCurrentDivisionId] = useState<string | null>(null);

  useEffect(() => {
    if (!counterId) {
      setConnectionError("Invalid counter ID");
      return;
    }

    const connectToServices = async () => {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // Step 1: Connect to counter channel
        console.log(`Connecting to counter: ${counterId}`);
        await counterService.connect(counterId);
        setCounterConnected(true);

        // Step 2: Check if counter has a divisionId
        // Wait a moment for counter state to be populated
        setTimeout(async () => {
          try {
            // Get counter state including divisionId
            const counterState = counterService.getCounterState(counterId);
            const divisionId = counterState?.divisionId;
            
            console.log('Counter state:', counterState);
            console.log('Division ID from counter:', divisionId);
            
            if (divisionId) {
              console.log(`Connecting to progress for division: ${divisionId}`);
              progressService.connect(divisionId);
              setCurrentDivisionId(divisionId);
              setProgressConnected(true);
            } else {
              console.log('No division connected to this counter');
            }
          } catch (error) {
            console.warn("Failed to connect to progress service:", error);
            // Not a critical error - controller can work with just counter connection
          }
        }, 500);

      } catch (error) {
        console.error("Failed to connect to counter service:", error);
        setConnectionError(`Failed to connect to counter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToServices();

    // Cleanup function
    return () => {
      console.log("Disconnecting from services");
      counterService.disconnect();
      progressService.disconnect();
      setCounterConnected(false);
      setProgressConnected(false);
      setCurrentDivisionId(null);
    };
  }, [counterId, counterService, progressService]);

  return {
    isConnecting,
    connectionError,
    counterConnected,
    progressConnected,
    currentDivisionId,
  };
};