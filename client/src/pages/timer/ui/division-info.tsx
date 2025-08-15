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
    <div className="flex flex-col items-center justify-between w-full">
      <div
        className="
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-8xl
          font-bold tracking-tight text-center text-foreground
          mb-6 break-keep
        "
        title="Division Name"
      >
        {divisionName}
      </div>
      <div
        className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-3xl font-medium text-muted-foreground"
        title="Stopwatch Name"
      >
        계수기: {stopwatchName}
      </div>
    </div>
  );
}
