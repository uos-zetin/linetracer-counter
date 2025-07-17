interface DivisionInfoProps {
  divisionName: string;
  stopwatchName?: string;
}

export function DivisionInfo({ divisionName, stopwatchName }: DivisionInfoProps) {
  const isLoading = !divisionName;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span
        className={`
          min-w-[10ch] min-h-[2.75rem] w-full inline-block align-top 
          px-[1vw]
          text-[4vw] font-bold tracking-tight text-center
          ${isLoading ? "animate-pulse bg-uos-gray-soft text-transparent" : "text-gray-800"}
          rounded
          `}
        title="Division Name"
        aria-busy={isLoading}
      >
        {isLoading ? "Loading..." : divisionName}
      </span>
      {stopwatchName && (
        <span className="text-[2vw] font-medium text-blue-600 mt-[0.25vw]" title="Stopwatch Name">
          계수기: {stopwatchName}
        </span>
      )}
    </div>
  );
}
