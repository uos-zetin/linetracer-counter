import { useEffect } from "react";
import { formatElapsedMs } from "@/entities/counter";
import { useParticipantService } from "@/features/participant";
import { useProgressService } from "@/features/progress";

export interface TopRecord {
  id: string;
  participantName: string;
  timeMs: number;
}

const rankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500/50 text-yellow-900 font-bold";
    case 2:
      return "bg-zinc-300/50 text-zinc-900 font-bold";
    case 3:
      return "bg-amber-600/50 text-amber-900 font-bold";
    default:
      return "";
  }
};

const ROW_COUNT = 5;
const RIGHT_COLUMN_OFFSET = ROW_COUNT; // 5
const RIGHT_COLUMN_START_RANK = ROW_COUNT + 1; // 6

export function TopRecordView() {
  const progressService = useProgressService();
  const adminParticipantService = useParticipantService();
  const topRecords = progressService.use.topRecords();
  const division = progressService.use.division();

  // Division이 있을 때 해당 division의 모든 participant를 로드
  useEffect(() => {
    const loadParticipants = async () => {
      if (division?.id) {
        try {
          await adminParticipantService.load.byDivision(division.id);
        } catch (error) {
          console.error("Failed to load participants for division:", error);
        }
      }
    };

    loadParticipants();
  }, [division?.id, adminParticipantService]);

  // Division의 모든 participant를 가져와서 매핑에 사용
  const participants = adminParticipantService.use.participantsByDivision(division?.id || "") || [];
  // Record를 TopRecord로 변환
  const formattedTopRecords: TopRecord[] = (topRecords || []).map((record) => {
    // Division의 participant 목록에서 해당 participantId 찾기
    const participant = participants.find((p) => p.id === record.participantId);
    const participantName = participant?.name || `Participant ${record.participantId.slice(0, 8)}`;

    return {
      id: record.id,
      participantName,
      timeMs: record.value,
    };
  });
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full h-full border border-border rounded-lg overflow-hidden shadow-sm bg-card flex flex-col">
      <div className="bg-muted py-1 sm:py-1.5 md:py-2">
        <h2 className="text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-4xl font-semibold text-foreground">최고 기록</h2>
      </div>

      <ul className="flex-1 flex flex-col">
        {rows.map((rowIdx) => {
          const left = formattedTopRecords[rowIdx];
          const right = formattedTopRecords[rowIdx + RIGHT_COLUMN_OFFSET];

          const bgLeft = (rowIdx + 1) % 2 ? "bg-muted/50" : "bg-card";
          const bgRight = (rowIdx + RIGHT_COLUMN_START_RANK) % 2 ? "bg-muted/50" : "bg-card";

          const leftRank = rowIdx + 1;
          const rightRank = rowIdx + RIGHT_COLUMN_START_RANK;
          const isLeftTopRank = leftRank <= 3;
          const isRightTopRank = rightRank <= 3;
          
          return (
            <li
              key={rowIdx}
              className="
                flex-1 grid grid-cols-[15%_35%_15%_35%] sm:grid-cols-[12%_38%_12%_38%] md:grid-cols-[10%_40%_10%_40%] lg:grid-cols-[7.5%_42.5%_7.5%_42.5%]
                text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-3xl
                font-medium border-t border-border
              "
            >
              <span
                className={`
                  flex items-center justify-center py-2 border-r border-border                   ${rankBg(leftRank) || `${bgLeft} text-foreground`}
                  ${isLeftTopRank ? '' : ''}
                `}
              >
                {rowIdx + 1}
              </span>
              <span
                className={`
                  flex items-center justify-center py-2 px-1 sm:px-2 md:px-3 lg:px-4                   ${rankBg(leftRank) || `${bgLeft} text-foreground`}
                  ${isLeftTopRank ? 'font-bold' : ''}
                `}
                title={left ? `${left.participantName} - ${formatElapsedMs(left.timeMs).toString()}s` : undefined}
              >
                {left ? (
                  <div className="text-center leading-none">
                    <div className={`truncate ${isLeftTopRank ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-3xl' : 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-2xl'}`}>{left.participantName}</div>
                    <div className={`${isLeftTopRank ? 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-2xl' : 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl'} text-muted-foreground`}>{formatElapsedMs(left.timeMs).toString()}s</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
              <span
                className={`
                  flex items-center justify-center py-2 border-x border-border                   ${rankBg(rightRank) || `${bgRight} text-foreground`}
                  ${isRightTopRank ? '' : ''}
                `}
              >
                {rowIdx + RIGHT_COLUMN_START_RANK}
              </span>
              <span
                className={`
                  flex items-center justify-center py-2 px-1 sm:px-2 md:px-3 lg:px-4                   ${rankBg(rightRank) || `${bgRight} text-foreground`}
                  ${isRightTopRank ? 'font-bold' : ''}
                `}
                title={right ? `${right.participantName} - ${formatElapsedMs(right.timeMs).toString()}s` : undefined}
              >
                {right ? (
                  <div className="text-center leading-none">
                    <div className={`truncate ${isRightTopRank ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-3xl' : 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-2xl'}`}>{right.participantName}</div>
                    <div className={`${isRightTopRank ? 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-2xl' : 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl'} text-muted-foreground`}>{formatElapsedMs(right.timeMs).toString()}s</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
