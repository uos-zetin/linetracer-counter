import { useCounterService } from "@/features/counter";
import { useProgressService } from "@/features/progress";

interface DivisionInfoProps {
  counterId: string;
}

export function DivisionInfo({ counterId }: DivisionInfoProps) {
  const counterService = useCounterService();
  const progressService = useProgressService();
  const counter = counterService.use.counterState(counterId);
  const division = progressService.use.division();

  const divisionName = division?.name || "No Division";
  const stopwatchName = counter?.name || "No Stopwatch";

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span
        className="
          min-w-[10ch] min-h-[2.75rem] w-full inline-block align-top 
          px-[1vw]
          text-[4vw] font-bold tracking-tight text-center text-gray-800
          rounded
        "
        title="Division Name"
      >
        {divisionName}
      </span>
      <span className="text-[2vw] font-medium text-blue-600 mt-[0.25vw]" title="Stopwatch Name">
        계수기: {stopwatchName}
      </span>
    </div>
  );
}
