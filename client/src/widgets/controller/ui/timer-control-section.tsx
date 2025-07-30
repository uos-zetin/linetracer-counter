import { TimerStartButton, TimerStopButton, TimerAdjustControls, TimerDisplay } from "@/features/timer-control";
import { useProgressService } from "@/features/progress";

interface TimerControlSectionProps {
  className?: string;
}

export const TimerControlSection = ({ 
  className = ""
}: TimerControlSectionProps) => {
  const progressService = useProgressService();
  
  // Get current runner from progress
  const currentRunner = progressService.useRunner();
  const participantId = currentRunner?.participant.id;

  if (!participantId) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Timer Control
        </h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-lg mb-2">No active runner</div>
          <div className="text-sm">Connect a division and set a current runner to control timer</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Timer Control
      </h2>
      
      <div className="space-y-4">
        <TimerDisplay
          participantId={participantId}
          participantName={currentRunner.participant.name}
        />
        
        <div className="flex space-x-3">
          <TimerStartButton
            participantId={participantId}
            className="flex-1"
          />
          <TimerStopButton
            participantId={participantId}
            className="flex-1"
          />
        </div>
        
        <TimerAdjustControls
          participantId={participantId}
        />
      </div>
    </div>
  );
};