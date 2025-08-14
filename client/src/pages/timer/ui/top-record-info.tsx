import { useEffect } from "react";
import { cn } from "@/shared/lib";
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
      <div className="bg-muted" style={{ padding: "0.5vh 0" }}>
        <h2 className="text-center font-semibold text-foreground" style={{ fontSize: "2.5vh" }}>
          최고 기록
        </h2>
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

          return (
            <li
              key={rowIdx}
              className={cn("flex-1 grid font-medium border-t border-border", "grid-cols-[10%_40%_10%_40%]")}
            >
              <span
                className={cn(
                  "flex items-center justify-center border-r border-border",
                  rankBg(leftRank) || `${bgLeft} text-foreground`
                )}
                style={{ padding: "1vh", fontSize: "2.0vh" }}
              >
                {rowIdx + 1}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center",
                  rankBg(leftRank) || `${bgLeft} text-foreground`,
                  isLeftTopRank && "font-bold"
                )}
                style={{ padding: "1vh 1.5vh" }}
                title={left ? `${left.participantName} - ${formatElapsedMs(left.timeMs).toString()}s` : undefined}
              >
                {left ? (
                  <div className="text-center leading-none">
                    <div className="font-bold" style={{ fontSize: isLeftTopRank ? "3vh" : "2.5vh" }}>
                      {formatElapsedMs(left.timeMs).toString()}s
                    </div>
                    <div
                      className="truncate text-muted-foreground"
                      style={{ fontSize: isLeftTopRank ? "2.5vh" : "2.0vh" }}
                    >
                      {left.participantName}
                    </div>
                  </div>
                ) : (
                  <div className="text-center leading-none">
                    <div className="text-muted-foreground font-bold" style={{ fontSize: "2.5vh" }}>
                      —
                    </div>
                    <div className="text-muted-foreground/60" style={{ fontSize: "2.0vh" }}>
                      -
                    </div>
                  </div>
                )}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center border-x border-border",
                  rankBg(rightRank) || `${bgRight} text-foreground`
                )}
                style={{ padding: "1vh", fontSize: "2.0vh" }}
              >
                {rowIdx + RIGHT_COLUMN_START_RANK}
              </span>
              <span
                className={cn("flex items-center justify-center", rankBg(rightRank) || `${bgRight} text-foreground`)}
                style={{ padding: "1vh 1.5vh" }}
                title={right ? `${right.participantName} - ${formatElapsedMs(right.timeMs).toString()}s` : undefined}
              >
                {right ? (
                  <div className="text-center leading-none">
                    <div className="font-bold" style={{ fontSize: "2.5vh" }}>
                      {formatElapsedMs(right.timeMs).toString()}s
                    </div>
                    <div className="truncate text-muted-foreground" style={{ fontSize: "1.5vh" }}>
                      {right.participantName}
                    </div>
                  </div>
                ) : (
                  <div className="text-center leading-none">
                    <div className="text-muted-foreground font-bold" style={{ fontSize: "2.5vh" }}>
                      —
                    </div>
                    <div className="text-muted-foreground/60" style={{ fontSize: "2.0vh" }}>
                      -
                    </div>
                  </div>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
