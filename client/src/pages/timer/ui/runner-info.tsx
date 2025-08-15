import { useProgressService } from "@/features/progress";

export function RunnerInfo() {
  const progressService = useProgressService();
  const runner = progressService.use.runner();

  const runnerName = runner?.participant.name || "No Runner";
  const runnerTeam = runner?.participant.teamName || "No Team";
  const runnerRobotName = runner?.participant.robotName || "No Robot";
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-7xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap text-center mb-2 sm:mb-3 max-w-full"
        title="Runner Name"
      >
        {runnerName} · {runnerRobotName}
      </span>
      <span
        className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-5xl font-semibold text-muted-foreground leading-none text-center overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
        title="Runner Team Name"
      >
        {runnerTeam}
      </span>
    </div>
  );
}
