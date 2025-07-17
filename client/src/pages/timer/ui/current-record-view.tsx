import type { Record } from "@/entities/record";
import { formatElapsedMs } from "@/entities/stopwatch";

interface CurrentRecordViewProps {
  currentRecords: Record[];
}

const ROW_COUNT = 5;

export function CurrentRecordView({ currentRecords }: CurrentRecordViewProps) {
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 py-[0.25vw]">
        <h2 className="text-center text-[1.5vw] font-semibold">현재 경연자 기록</h2>
      </div>
      <ul>
        {rows.map((idx) => {
          const rec = currentRecords[idx];
          const bg = idx % 2 === 0 ? "bg-gray-50" : "bg-white";

          return (
            <li
              key={idx}
              className={`
                grid grid-cols-[15%_1fr]
                border-t border-gray-200 text-[1.5vw]
                ${bg} text-gray-800 font-medium
              `}
            >
              {/* 순번 셀 ― 정사각형 + 중앙 */}
              <span className="flex items-center justify-center aspect-[3/4] border-r border-gray-200">{idx + 1}</span>

              {/* 기록(초) 셀 */}
              <span className="flex items-center justify-center truncate px-[0.5vw]">
                {rec ? formatElapsedMs(rec.value).toString() : <span className="text-gray-400">—</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
