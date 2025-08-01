import { formatElapsedMs } from "@/entities/counter";
import { useProgressService } from "@/features/progress";

export interface TopRecord {
  id: string;
  participantName: string;
  timeMs: number;
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

export function TopRecordView() {
  const progressService = useProgressService();
  const topRecords = progressService.useTopRecords();
  const runner = progressService.useRunner();
  const nextRunners = progressService.useNextRunners();

  // Record를 TopRecord로 변환
  const formattedTopRecords: TopRecord[] = (topRecords || []).map((record) => {
    // 현재 runner나 nextRunners에서 participant 이름을 찾아보기
    let participantName = `Participant ${record.participantId.slice(0, 8)}`;
    
    if (runner?.participant.id === record.participantId) {
      participantName = runner.participant.name;
    } else {
      const foundParticipant = nextRunners.find((p) => p.id === record.participantId);
      if (foundParticipant) {
        participantName = foundParticipant.name;
      }
    }

    return {
      id: record.id,
      participantName,
      timeMs: record.value,
    };
  });
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gray-100 py-[0.25vw]">
        <h2 className="text-center text-[1.5vw] font-semibold">최고 기록</h2>
      </div>

      <ul>
        {rows.map((rowIdx) => {
          const left = formattedTopRecords[rowIdx];
          const right = formattedTopRecords[rowIdx + RIGHT_COLUMN_OFFSET];

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
