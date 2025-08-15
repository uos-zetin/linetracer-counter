import { useProgressService } from "@/features/progress";

const ROW_COUNT = 5;

export function NextRunnerInfo() {
  const progressService = useProgressService();
  const nextRunners = progressService.use.nextRunners();
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full h-full border border-border rounded-lg overflow-hidden shadow-sm bg-card flex flex-col">
      <div className="bg-muted py-1 sm:py-1.5 md:py-2">
        <h2 className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-4xl font-semibold text-foreground">
          다음 경연자
        </h2>
      </div>

      <ul className="flex-1 flex flex-col">
        {rows.map((idx) => {
          const runner = nextRunners[idx];
          const highlight = idx === 0 && runner;

          return (
            <li
              key={idx}
              className={`
                flex-1 grid grid-cols-[15%_1fr]
                border-t border-border 
                text-s sm:text-s md:text-m lg:text-lg xl:text-xl 2xl:text-4xl
                ${
                  highlight
                    ? "bg-yellow-100 text-yellow-800 font-bold"
                    : "odd:bg-muted/50 even:bg-card text-foreground font-medium"
                }
              `}
            >
              <span className="flex items-center justify-center border-r border-border ">{idx + 1}</span>
              <span className="flex items-center justify-center truncate ">
                {runner ? runner.name : <span className="text-muted-foreground">—</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
