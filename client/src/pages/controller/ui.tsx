import { 
  ControllerLayout,
  CounterControlSection,
  TimerControlSection,
  ProgressMonitorSection,
  RecordControlSection,
  DivisionControlSection,
  ManualRecordSection
} from "@/widgets/controller";
import { useCounterId } from "./lib/use-counter-id";
import { useControllerState } from "./lib/use-controller-state";

export const ControllerPage = () => {
  const counterId = useCounterId();
  const { 
    isConnecting, 
    connectionError, 
    counterConnected, 
    progressConnected,
    currentDivisionId 
  } = useControllerState(counterId);

  // Handle invalid counterId
  if (!counterId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Counter ID</h1>
          <p className="text-gray-600 mb-4">
            Please provide a valid counter ID in the URL.
          </p>
          <p className="text-sm text-gray-500">
            Example: /controller/counter-001
          </p>
        </div>
      </div>
    );
  }

  // Handle connection error
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle connecting state
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connecting...</h1>
          <p className="text-gray-600">
            Establishing connection to counter {counterId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ControllerLayout counterId={counterId}>
      {/* Connection Status Banner */}
      <div className="col-span-full mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Connection Status</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${counterConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Counter {counterConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${progressConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Progress {progressConnected ? 'Connected' : 'Not Connected'}</span>
              </div>
              {currentDivisionId && (
                <div className="text-gray-600">
                  Division: {currentDivisionId}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Sections Grid */}
      <CounterControlSection counterId={counterId} />
      
      {counterConnected && (
        <>
          <ProgressMonitorSection />
          <TimerControlSection counterId={counterId} />
          <RecordControlSection />
          <DivisionControlSection />
          <ManualRecordSection />
        </>
      )}

      {/* Empty state when not connected */}
      {!counterConnected && (
        <div className="col-span-full">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Waiting for Connection
            </h3>
            <p className="text-gray-600">
              Please wait while we establish connection to the counter service.
            </p>
          </div>
        </div>
      )}
    </ControllerLayout>
  );
};