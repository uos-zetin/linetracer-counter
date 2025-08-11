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
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 
          font-bold tracking-tight text-center text-foreground
          mb-2 sm:mb-3
        "
        title="Division Name"
      >
        {divisionName}
      </span>
      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-muted-foreground" title="Stopwatch Name">
        계수기: {stopwatchName}
      </span>
    </div>
  );
}
