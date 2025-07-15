interface DivisionInfoProps {
  divisionName: string;
}

export function DivisionInfo({ divisionName }: DivisionInfoProps) {
  const isLoading = !divisionName;

  return (
    <span
      className={`
        min-w-[10ch] min-h-[2.75rem] w-full inline-block align-top 
        px-4
        text-[4vw] font-bold tracking-tight text-center
        ${isLoading ? "animate-pulse bg-uos-gray-soft text-transparent" : "text-gray-800"}
        rounded
        `}
      title="Division Name"
      aria-busy={isLoading}
    >
      {isLoading ? "Loading..." : divisionName}
    </span>
  );
}
