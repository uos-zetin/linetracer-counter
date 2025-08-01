import { useProgressService } from "@/features/progress";

export function RunnerInfo() {
  const progressService = useProgressService();
  const runner = progressService.useRunner();
  
  const runnerName = runner?.participant.name || "No Runner";
  const runnerTeam = runner?.participant.teamName || "No Team";
  const runnerRobotName = runner?.participant.robotName || "No Robot";
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span className="text-[4vw] font-bold text-gray-800 overflow-hidden overflow-ellipsis" title="Runner Name">
        {runnerName} · {runnerRobotName}
      </span>
      <span className="text-[3vw] font-semibold text-gray-600 leading-none" title="Runner Robot Name">
        {runnerTeam}
      </span>
    </div>
  );
}
