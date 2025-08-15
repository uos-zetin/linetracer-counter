import { useProgressService } from "@/features/progress";

export function DivisionInfo() {
  const progressService = useProgressService();
  const division = progressService.use.division();
  const divisionName = division?.name || "No Division";

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-8xl
          font-bold tracking-tight text-center text-foreground break-keep
        "
        title="Division Name"
      >
        {divisionName}
      </div>
    </div>
  );
}
