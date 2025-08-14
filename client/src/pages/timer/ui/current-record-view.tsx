import { useMemo } from "react";
import { formatElapsedMs } from "@/entities/counter";
import { useProgressService } from "@/features/progress";

const ROW_COUNT = 5;

export function CurrentRecordView() {
  const progressService = useProgressService();
  const runner = progressService.use.runner();
  const filteredRecords = useMemo(() => {
    const records = runner?.records || [];
    return records
      .filter((record) => record.status === "approved")
      .slice()
      .sort((a, b) => a.value - b.value);
  }, [runner?.records]);
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

  return (
    <div className="w-full h-full border border-border rounded-lg overflow-hidden shadow-sm bg-card flex flex-col">
      <div className="bg-muted" style={{ padding: "0.5vh 0" }}>
        <h2 className="text-center font-semibold text-foreground" style={{ fontSize: "2.5vh" }}>
          현재 경연자 기록
        </h2>
      </div>
      <ul className="flex-1 flex flex-col">
        {rows.map((idx) => {
          const rec = filteredRecords[idx];
          const bg = idx % 2 === 0 ? "bg-muted/50" : "bg-card";

          return (
            <li
              key={idx}
              className={`
                flex-1 grid grid-cols-[15%_1fr]
                border-t border-border 
                ${bg} text-foreground font-medium
                `}
              style={{ fontSize: "2vh" }}
            >
              <span
                className="flex items-center justify-center border-r border-border"
                style={{ padding: "1vh", fontSize: "2.0vh" }}
              >
                {idx + 1}
              </span>
              <span
                className="flex items-center justify-center truncate"
                style={{ padding: "1vh 1.5vh", fontSize: "2.5vh" }}
              >
                {rec ? formatElapsedMs(rec.value).toString() : <span className="text-muted-foreground">—</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
