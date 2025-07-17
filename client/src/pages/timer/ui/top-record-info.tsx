import { formatElapsedMs } from "@/entities/stopwatch";

export interface TopRecord {
  id: string;
  participantName: string;
  timeMs: number;
}

interface TopRecordViewProps {
  topRecords: TopRecord[];
}

const rankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500/50 text-gray-900 font-bold";
    case 2:
      return "bg-zinc-300/50 text-gray-900 font-bold";
    case 3:
      return "bg-amber-600/50 text-gray-900 font-bold";
    default:
      return "";
  }
};

const ROW_COUNT = 5;
const RIGHT_COLUMN_OFFSET = ROW_COUNT; // 5
const RIGHT_COLUMN_START_RANK = ROW_COUNT + 1; // 6

export function TopRecordView({ topRecords }: TopRecordViewProps) {
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 py-[0.25vw]">
        <h2 className="text-center text-[1.5vw] font-semibold">최고 기록</h2>
      </div>

      <ul>
        {rows.map((rowIdx) => {
          const left = topRecords[rowIdx];
          const right = topRecords[rowIdx + RIGHT_COLUMN_OFFSET];

          const bgLeft = (rowIdx + 1) % 2 ? "bg-gray-50" : "bg-white";
          const bgRight = (rowIdx + RIGHT_COLUMN_START_RANK) % 2 ? "bg-gray-50" : "bg-white";

          return (
            <li
              key={rowIdx}
              className="
                grid grid-cols-[7.5%_42.5%_7.5%_42.5%]
                text-[1.5vw] font-medium border-t border-gray-200
              "
            >
              <span
                className={`
                  flex items-center justify-center aspect-[3/4] border-r border-gray-200
                  ${rankBg(rowIdx + 1) || `${bgLeft} text-gray-800`}
                `}
              >
                {rowIdx + 1}
              </span>
              <span
                className={`
                  flex items-center justify-center truncate px-[0.5vw]
                  ${rankBg(rowIdx + 1) || `${bgLeft} text-gray-800`}
                `}
                title={left ? `${left.participantName} - ${formatElapsedMs(left.timeMs).toString()}s` : undefined}
              >
                {left ? (
                  `${left.participantName} - ${formatElapsedMs(left.timeMs).toString()}`
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </span>
              <span
                className={`
                  flex items-center justify-center aspect-[3/4] border-x border-gray-200
                  ${rankBg(rowIdx + RIGHT_COLUMN_START_RANK) || `${bgRight} text-gray-800`}
                `}
              >
                {rowIdx + RIGHT_COLUMN_START_RANK}
              </span>
              <span
                className={`
                  flex items-center justify-center truncate px-[0.5vw]
                  ${bgRight} text-gray-800
                `}
                title={right ? `${right.participantName} - ${formatElapsedMs(right.timeMs).toString()}s` : undefined}
              >
                {right ? (
                  `${right.participantName} - ${formatElapsedMs(right.timeMs).toString()}`
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
