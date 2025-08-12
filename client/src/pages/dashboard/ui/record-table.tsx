import { useEffect, useState } from "react";
import { formatElapsedMs } from "@/entities/counter";
import type { Participant } from "@/entities/participant";
import type { Record } from "@/entities/record";
import { useRecordService } from "@/features/record";

interface RecordTableProps {
  divisionId: string;
  participants: Participant[];
  getParticipantName: (participantId: string) => string;
  refreshTrigger: Date;
}

export function RecordTable({ divisionId, participants, getParticipantName, refreshTrigger }: RecordTableProps) {
  const recordService = useRecordService();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRecords = async () => {
      if (!divisionId) {
        setRecords([]);
        return;
      }

      setLoading(true);
      try {
        const topRecords = await recordService.load.topByDivision(divisionId);
        setRecords(topRecords || []);
      } catch (error) {
        console.error(`Failed to load records for division ${divisionId}:`, error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [divisionId, refreshTrigger, recordService]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl mb-2">⏳</div>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-border/50 rounded-lg">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-muted-foreground">기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="text-left p-3 font-medium text-foreground">순위</th>
            <th className="text-left p-3 font-medium text-foreground">이름</th>
            <th className="text-left p-3 font-medium text-foreground">소속</th>
            <th className="text-left p-3 font-medium text-foreground">로봇 이름</th>
            <th className="text-right p-3 font-medium text-foreground">기록</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, index) => {
            const participant = participants.find((p) => p.id === record.participantId);

            return (
              <tr key={record.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="p-3 text-foreground">{index + 1}</td>
                <td className="p-3 font-medium text-foreground">{getParticipantName(record.participantId)}</td>
                <td className="p-3 text-muted-foreground">{participant?.teamName || "-"}</td>
                <td className="p-3 text-muted-foreground">{participant?.robotName || "-"}</td>
                <td className="p-3 text-right text-foreground">{formatElapsedMs(record.value).toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
