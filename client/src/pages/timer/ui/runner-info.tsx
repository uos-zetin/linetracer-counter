import { useProgressService } from "@/features/progress";

export function RunnerInfo() {
  const progressService = useProgressService();
  const runner = progressService.use.runner();

  const runnerName = runner?.participant.name || "No Runner";
  const runnerTeam = runner?.participant.teamName || "No Team";
  const runnerRobotName = runner?.participant.robotName || "No Robot";
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground overflow-hidden text-ellipsis text-center mb-2 sm:mb-3" title="Runner Name">
        {runnerName} · {runnerRobotName}
      </span>
      <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-muted-foreground leading-none text-center" title="Runner Team Name">
        {runnerTeam}
      </span>
    </div>
  );
}
