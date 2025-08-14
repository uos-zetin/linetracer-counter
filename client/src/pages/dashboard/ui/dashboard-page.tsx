import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { Division } from "@/entities/division";
import { useCompetitionService } from "@/features/competition";
import { useDivisionService } from "@/features/division";
import { useParticipantService } from "@/features/participant";
import { PageContainer } from "@/widgets/page-container";
import { CompetitionOrderModal } from "./competition-order-modal";
import { RecordTable } from "./record-table";

export const DashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const competitionId = searchParams.get("competitionId");
  const divisionId = searchParams.get("divisionId");

  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const participantService = useParticipantService();

  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>(competitionId || "");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(divisionId || "");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  const competitions = competitionService.use.competitions();
  const divisions = divisionService.use.divisionsByCompetition(selectedCompetitionId || "");
  const participants = participantService.use.allParticipants();

  // 대회 목록 로드
  useEffect(() => {
    const loadCompetitions = async () => {
      try {
        await competitionService.load.all();
      } catch (error) {
        console.error("Failed to load competitions:", error);
      }
    };

    loadCompetitions();
  }, [competitionService]);

  // 대회 선택 시 부문 목록 로드
  useEffect(() => {
    if (selectedCompetitionId) {
      const loadDivisions = async () => {
        try {
          await divisionService.load.byCompetition(selectedCompetitionId);
        } catch (error) {
          console.error("Failed to load divisions:", error);
        }
      };

      loadDivisions();
    }
  }, [selectedCompetitionId, divisionService]);

  // 부문 로드 완료 후 참가자 로드
  useEffect(() => {
    if (selectedCompetitionId && divisions.length > 0) {
      const loadParticipants = async () => {
        try {
          const divisionIds = divisions.map((d: Division) => d.id);
          await participantService.load.byDivisions(divisionIds);
        } catch (error) {
          console.error("Failed to load participants:", error);
        }
      };

      loadParticipants();
    }
  }, [selectedCompetitionId, divisions, participantService]);

  // 매분마다 새로고침 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // URL에서 competitionId가 변경되면 상태 업데이트
  useEffect(() => {
    setSelectedCompetitionId(competitionId || "");
  }, [competitionId]);

  // URL에서 divisionId가 변경되면 상태 업데이트
  useEffect(() => {
    setSelectedDivisionId(divisionId || "");
  }, [divisionId]);

  // 대회 선택 핸들러
  const handleCompetitionChange = (newCompetitionId: string) => {
    setSelectedCompetitionId(newCompetitionId);
    setSelectedDivisionId(""); // 대회 변경 시 부문 선택 초기화

    if (newCompetitionId) {
      setSearchParams({ competitionId: newCompetitionId });
    } else {
      setSearchParams({});
    }
  };

  // 부문 선택 핸들러
  const handleDivisionChange = (newDivisionId: string) => {
    const actualDivisionId = newDivisionId === "all" ? "" : newDivisionId;
    setSelectedDivisionId(actualDivisionId);

    if (selectedCompetitionId) {
      if (actualDivisionId) {
        setSearchParams({ competitionId: selectedCompetitionId, divisionId: actualDivisionId });
      } else {
        setSearchParams({ competitionId: selectedCompetitionId });
      }
    }
  };

  const selectedCompetition = competitions.find((c) => c.id === selectedCompetitionId);

  // 참가자 ID로 이름 찾기
  const getParticipantName = (participantId: string): string => {
    const participant = participants.find((p) => p.id === participantId);
    return participant?.name || `Unknown Participant`;
  };

  return (
    <div className="min-h-screen bg-background">
      <PageContainer maxWidth="lg" padding="md">
        <div className="my-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">📊 Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">실시간 순위, 최고 기록, 경연 순번을 확인하세요</p>
            <p className="text-xs text-muted-foreground">마지막 업데이트: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

        {/* 대회 선택 드롭다운 */}
        <Card className="mb-4">
          <CardContent className="px-6 py-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">대회 선택</Label>
              <Select value={selectedCompetitionId} onValueChange={handleCompetitionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="대회를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 선택된 대회가 있을 때만 부문 선택 및 기록 표시 */}
        {selectedCompetitionId && selectedCompetition && (
          <>
            {/* 부문 선택 드롭다운 */}
            <Card className="mb-4">
              <CardContent className="px-6 py-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    부문 선택 <span className="text-xs text-muted-foreground">(선택사항)</span>
                  </Label>
                  <Select value={selectedDivisionId || "all"} onValueChange={handleDivisionChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="모든 부문 보기" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 부문</SelectItem>
                      {divisions.map((division: Division) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 대회 정보 */}
            <Card className="mb-4 gap-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">{selectedCompetition.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-0">
                <p className="text-muted-foreground">{selectedCompetition.description}</p>
              </CardContent>
            </Card>

            {/* Top Records 표시 영역 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {selectedDivisionId ? "부문별 최고 기록" : "전체 부문 최고 기록"}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrderModalOpen(true)}
                    disabled={!selectedCompetitionId}
                  >
                    경연 순서
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-0">
                {selectedDivisionId ? (
                  <RecordTable
                    divisionId={selectedDivisionId}
                    participants={participants}
                    getParticipantName={getParticipantName}
                    refreshTrigger={lastUpdated}
                  />
                ) : (
                  <div className="space-y-4">
                    {divisions
                      .sort((a: Division, b: Division) => a.name.localeCompare(b.name))
                      .map((division: Division) => (
                        <div key={division.id}>
                          <h4 className="text-base font-semibold text-foreground mb-2 border-l-4 border-primary pl-2">
                            {division.name}
                          </h4>
                          <RecordTable
                            divisionId={division.id}
                            participants={participants}
                            getParticipantName={getParticipantName}
                            refreshTrigger={lastUpdated}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* 대회가 선택되지 않았을 때 */}
        {!selectedCompetitionId && (
          <Card className="text-center border-2 border-dashed border-border/50">
            <CardContent className="px-6 py-12">
              <div className="text-4xl mb-3">🏁</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">경기를 선택해주세요</h2>
              <p className="text-sm text-muted-foreground">
                위에서 대회를 선택하시면 실시간 순위와 기록을 확인할 수 있습니다
              </p>
            </CardContent>
          </Card>
        )}

        {/* 경연 순서 모달 */}
        <CompetitionOrderModal
          open={orderModalOpen}
          onOpenChange={setOrderModalOpen}
          divisions={divisions}
          participants={participants}
          getParticipantName={getParticipantName}
        />
      </PageContainer>
    </div>
  );
};
