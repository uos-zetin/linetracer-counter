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
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div
        className="font-bold text-center text-foreground break-keep w-full max-w-full"
        style={{ fontSize: "4.5vh", marginBottom: "1vh" }}
        title="Division Name"
      >
        <div className="truncate">{divisionName}</div>
      </div>
      <span className="font-medium text-muted-foreground" style={{ fontSize: "2.5vh" }} title="Stopwatch Name">
        계수기: {stopwatchName}
      </span>
    </div>
  );
}
