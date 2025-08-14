import { useProgressService } from "@/features/progress";

export function RunnerInfo() {
  const progressService = useProgressService();
  const runner = progressService.use.runner();

  const runnerName = runner?.participant.name || "No Runner";
  const runnerTeam = runner?.participant.teamName || "No Team";
  const runnerRobotName = runner?.participant.robotName || "No Robot";
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-2">
      <div
        className="font-bold text-foreground text-center w-full max-w-full"
        style={{ fontSize: "4.5vh", marginBottom: "1vh" }}
        title="Runner Name"
      >
        <div className="truncate">
          {runnerName} · {runnerRobotName}
        </div>
      </div>
      <div
        className="font-semibold text-muted-foreground leading-none text-center w-full max-w-full"
        style={{ fontSize: "2.5vh" }}
        title="Runner Team Name"
      >
        <div className="truncate">{runnerTeam}</div>
      </div>
    </div>
  );
}
