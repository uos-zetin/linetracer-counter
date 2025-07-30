import { CounterDivisionConnector, CounterResetButton, CounterStatusDisplay } from "@/features/counter";
import { useProgressService } from "@/features/progress";
import { useAdminDivisionService } from "@/features/admin-division";

interface CounterControlSectionProps {
  counterId: string;
  className?: string;
}

export const CounterControlSection = ({ 
  counterId, 
  className = ""
}: CounterControlSectionProps) => {
  const progressService = useProgressService();
  const adminDivisionService = useAdminDivisionService();
  
  // Get progress state (should be connected if counter has divisionId)
  const currentDivision = progressService.useDivision();
  const allDivisions = adminDivisionService.useDivisions();

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Counter Control
      </h2>
      
      <div className="space-y-4">
        <CounterStatusDisplay 
          counterId={counterId}
          counterName={`Counter ${counterId}`}
          divisionName={currentDivision?.name}
        />
        
        <CounterDivisionConnector
          counterId={counterId}
          currentDivisionId={currentDivision?.id || null}
          availableDivisions={allDivisions}
        />
        
        <CounterResetButton
          counterId={counterId}
          className="w-full"
        />
      </div>
    </div>
  );
};