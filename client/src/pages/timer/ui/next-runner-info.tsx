import type { Participant } from "@/entities/participant";

interface NextRunnerInfoProps {
  nextRunners: Participant[];
}

const ROW_COUNT = 5;

export function NextRunnerInfo({ nextRunners }: NextRunnerInfoProps) {
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 py-[0.25vw]">
        <h2 className="text-center text-[1.5vw] font-semibold">다음 경연자</h2>
      </div>

      <ul>
        {rows.map((idx) => {
          const runner = nextRunners[idx];
          const highlight = idx === 0 && runner;

          return (
            <li
              key={idx}
              className={`
                grid grid-cols-[15%_1fr]
                border-t border-gray-200 text-[1.5vw]
                ${
                  highlight
                    ? "bg-yellow-100 text-yellow-800 font-bold"
                    : "odd:bg-gray-50 even:bg-white text-gray-800 font-medium"
                }  // 줄무늬
              `}
            >
              <span className="flex items-center justify-center aspect-[3/4] border-r border-gray-200">{idx + 1}</span>
              <span className="flex items-center justify-center truncate px-[0.5vw]">
                {runner ? runner.name : <span className="text-gray-400">—</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
