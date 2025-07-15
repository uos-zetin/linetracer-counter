interface RunnerInfoProps {
  runnerName: string;
  runnerTeam: string;
  runnerRobotName: string;
}

export function RunnerInfo({ runnerName, runnerTeam, runnerRobotName }: RunnerInfoProps) {
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
