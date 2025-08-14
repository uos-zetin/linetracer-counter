import type { CompetitionRepository, CompetitionForm } from "@/entities/competition";
import type { DivisionRepository, DivisionForm } from "@/entities/division";
import type { ParticipantRepository } from "@/entities/participant";
import { parseCsvFile } from "../lib/parse-csv";
import { retryWithBackoff } from "../lib/retry-utils";
import type {
  CsvProcessState,
  CsvProcessResult,
  CsvProcessStep,
  CreatedEntity,
  GroupedData,
  DivisionSummary,
  CsvImportOptions,
} from "./types";

export interface CsvServiceDependencies {
  competitionRepository: CompetitionRepository;
  divisionRepository: DivisionRepository;
  participantRepository: ParticipantRepository;
}

/**
 * CSV를 통한 대회 데이터 일괄 등록 서비스
 */
export function createCsvService(dependencies: CsvServiceDependencies) {
  const { competitionRepository, divisionRepository, participantRepository } = dependencies;

  let currentProcessState: CsvProcessState = {
    currentStep: "idle",
    progress: 0,
    stepProgress: 0,
    completedCount: 0,
    totalCount: 0,
    retryCount: 0,
  };

  let onStateChange: ((state: CsvProcessState) => void) | null = null;
  let abortController: AbortController | null = null;

  /**
   * 상태 변경 콜백 등록
   */
  const setOnStateChange = (callback: (state: CsvProcessState) => void) => {
    onStateChange = callback;
  };

  /**
   * 현재 상태 반환
   */
  const getState = (): CsvProcessState => ({ ...currentProcessState });

  /**
   * 상태 업데이트 및 콜백 호출
   */
  const updateState = (updates: Partial<CsvProcessState>) => {
    currentProcessState = { ...currentProcessState, ...updates };
    onStateChange?.(getState());
  };

  /**
   * 처리 단계 변경
   */
  const setStep = (step: CsvProcessStep, progress: number = 0) => {
    updateState({
      currentStep: step,
      progress,
      stepProgress: 0,
      currentItem: undefined,
      retryCount: 0,
    });
  };

  /**
   * 진행률 업데이트
   */
  const updateProgress = (stepProgress: number, currentItem?: string) => {
    updateState({
      stepProgress: Math.min(100, Math.max(0, stepProgress)),
      currentItem,
    });
  };

  /**
   * 재시도 횟수 증가
   */
  const incrementRetry = () => {
    updateState({
      retryCount: currentProcessState.retryCount + 1,
    });
  };

  /**
   * 대회 생성
   */
  const createCompetition = async (competitionName: string, options?: CsvImportOptions): Promise<string> => {
    setStep("creating_competition", 10);
    updateProgress(0, `대회 "${competitionName}" 생성 중...`);

    const competitionData: CompetitionForm = {
      name: competitionName,
      description: options?.competitionDescription || `CSV로 생성된 대회 - ${new Date().toLocaleDateString()}`,
    };

    const result = await retryWithBackoff(
      async () => {
        if (abortController?.signal.aborted) {
          throw new Error("작업이 취소되었습니다");
        }
        return await competitionRepository.createCompetition(competitionData);
      },
      {
        maxRetries: 4,
        onRetry: (attempt) => {
          incrementRetry();
          updateProgress(attempt * 25, `대회 생성 재시도 중... (${attempt}회)`);
        },
      }
    );

    if (!result.success) {
      throw new Error(`대회 생성 실패: ${result.error}`);
    }

    updateProgress(100, `대회 "${competitionName}" 생성 완료`);
    return result.data?.id || `competition-${competitionName}-${Date.now()}`;
  };

  /**
   * 부문 생성 (병렬 처리)
   */
  const createDivisions = async (
    competitionId: string,
    divisionNames: string[],
    options?: CsvImportOptions
  ): Promise<Record<string, string>> => {
    setStep("creating_divisions", 30);
    const divisionIdMap: Record<string, string> = {};

    const totalDivisions = divisionNames.length;
    let completedDivisions = 0;

    // 부문별 생성 작업을 병렬로 실행
    const divisionTasks = divisionNames.map(async (divisionName) => {
      // 해당 부문의 설정 찾기
      const divisionSetting = options?.divisionSettings?.find((setting) => setting.divisionName === divisionName);

      const divisionData: DivisionForm = {
        competitionId,
        name: divisionName,
        timeLimit: divisionSetting?.timeLimit || 180, // 기본 3분
        description: divisionSetting?.description || `CSV로 생성된 부문`,
      };

      const result = await retryWithBackoff(
        async () => {
          if (abortController?.signal.aborted) {
            throw new Error("작업이 취소되었습니다");
          }
          return await divisionRepository.createDivision(divisionData);
        },
        {
          maxRetries: 4,
          onRetry: (attempt) => {
            incrementRetry();
            updateProgress(
              (completedDivisions / totalDivisions) * 100,
              `부문 "${divisionName}" 생성 재시도 중... (${attempt}회)`
            );
          },
        }
      );

      if (result.success && result.data) {
        divisionIdMap[divisionName] = result.data.id;
        completedDivisions++;
        updateProgress(
          (completedDivisions / totalDivisions) * 100,
          `부문 "${divisionName}" 생성 완료 (${completedDivisions}/${totalDivisions})`
        );
        return { name: divisionName, id: result.data.id };
      } else {
        throw new Error(`부문 "${divisionName}" 생성 실패: ${result.error}`);
      }
    });

    await Promise.all(divisionTasks);
    updateProgress(100, `${totalDivisions}개 부문 생성 완료`);
    return divisionIdMap;
  };

  /**
   * 참가자 일괄 등록 (부문별)
   */
  const createParticipants = async (
    groupedData: GroupedData[],
    divisionIdMap: Record<string, string>
  ): Promise<CreatedEntity[]> => {
    setStep("creating_participants", 60);

    const totalGroups = groupedData.length;
    let completedGroups = 0;
    const allCreatedParticipants: CreatedEntity[] = [];

    for (const group of groupedData) {
      const divisionId = divisionIdMap[group.divisionName];
      if (!divisionId) {
        throw new Error(`부문 "${group.divisionName}"에 해당하는 ID를 찾을 수 없습니다`);
      }

      updateProgress(
        (completedGroups / totalGroups) * 100,
        `부문 "${group.divisionName}" 참가자 등록 중... (${group.participants.length}명)`
      );

      // 참가자 데이터를 ParticipantForm 형식에 맞게 변환
      const participantData = group.participants.map((participant) => ({
        divisionId, // 이미 위에서 정의됨
        name: participant.name,
        teamName: participant.team, // team → teamName
        robotName: participant.robotName,
        comment: participant.comment,
        orderRaw: parseInt(participant.orderRaw, 10) || 0, // orderRaw는 number 타입
      }));

      const result = await retryWithBackoff(
        async () => {
          if (abortController?.signal.aborted) {
            throw new Error("작업이 취소되었습니다");
          }
          // 배치 API를 사용하여 참가자 일괄 생성
          const createdParticipants = await participantRepository.createParticipants(divisionId, participantData);
          return createdParticipants;
        },
        {
          maxRetries: 4,
          onRetry: (attempt) => {
            incrementRetry();
            updateProgress(
              (completedGroups / totalGroups) * 100,
              `부문 "${group.divisionName}" 참가자 등록 재시도 중... (${attempt}회)`
            );
          },
        }
      );

      if (!result.success || !result.data) {
        throw new Error(`부문 "${group.divisionName}" 참가자 등록 실패: ${result.error}`);
      }

      // 생성된 참가자 엔티티 추가
      const createdParticipantEntities: CreatedEntity[] = result.data.map((participant) => ({
        type: "participant",
        id: participant.id,
        name: participant.name,
        createdAt: new Date(),
      }));

      allCreatedParticipants.push(...createdParticipantEntities);

      completedGroups++;
      updateProgress(
        (completedGroups / totalGroups) * 100,
        `부문 "${group.divisionName}" 참가자 ${result.data.length}명 등록 완료`
      );
    }

    updateProgress(100, `모든 참가자 등록 완료`);
    return allCreatedParticipants;
  };

  /**
   * CSV 파일을 통한 전체 데이터 처리
   */
  const processCSV = async (file: File, options?: CsvImportOptions): Promise<CsvProcessResult> => {
    const startTime = Date.now();
    abortController = new AbortController();

    const createdEntities: CreatedEntity[] = [];
    const failedItems: CsvProcessResult["failedItems"] = [];

    try {
      // 1. CSV 파싱
      setStep("parsing", 0);
      updateProgress(0, "CSV 파일 파싱 중...");

      const parseResult = await parseCsvFile(file);
      if (!parseResult.success || !parseResult.data || !parseResult.groupedData || !parseResult.competitionName) {
        throw new Error(parseResult.error || "CSV 파싱에 실패했습니다");
      }

      updateProgress(100, `${parseResult.data.length}명의 참가자 데이터 파싱 완료`);

      // 2. 데이터 검증
      setStep("validating", 5);
      const groupedData = parseResult.groupedData;
      const competitionName = parseResult.competitionName;
      updateProgress(100, `데이터 검증 완료 - 대회: ${competitionName}, 부문: ${groupedData.length}개`);

      // 3. 대회 생성
      const competitionId = await createCompetition(competitionName, options);
      createdEntities.push({
        type: "competition",
        id: competitionId,
        name: competitionName,
        createdAt: new Date(),
      });

      // 4. 부문 생성
      const divisionNames = groupedData.map((g) => g.divisionName);
      const divisionIdMap = await createDivisions(competitionId, divisionNames, options);

      divisionNames.forEach((name) => {
        createdEntities.push({
          type: "division",
          id: divisionIdMap[name],
          name,
          createdAt: new Date(),
        });
      });

      // 5. 참가자 생성
      const createdParticipantEntities = await createParticipants(groupedData, divisionIdMap);

      // 참가자 엔티티 추가 (실제 서버에서 생성된 데이터 사용)
      createdEntities.push(...createdParticipantEntities);

      // 6. 부문별 요약 정보 생성
      const divisionSummaries: DivisionSummary[] = groupedData.map((group) => {
        const divisionParticipants = createdParticipantEntities.filter((entity) =>
          // 부문별 참가자를 정확히 구분하기 위해 원본 데이터와 매칭
          group.participants.some((p) => p.name === entity.name)
        );

        return {
          divisionName: group.divisionName,
          firstParticipantName: divisionParticipants[0]?.name || group.participants[0]?.name || "",
          totalParticipants: group.participants.length,
        };
      });

      // 완료
      setStep("completed", 100);
      updateProgress(100, "모든 작업 완료!");

      return {
        success: true,
        createdEntities,
        divisionSummaries,
        failedItems,
        processingTime: Date.now() - startTime,
        fileInfo: {
          name: file.name,
          size: file.size,
          rowCount: parseResult.data.length,
        },
      };
    } catch (error) {
      setStep("error", 0);
      updateState({
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
      });

      return {
        success: false,
        createdEntities,
        failedItems: [
          {
            type: "competition",
            name: file.name,
            error: error instanceof Error ? error.message : "처리 실패",
          },
        ],
        processingTime: Date.now() - startTime,
        fileInfo: {
          name: file.name,
          size: file.size,
          rowCount: 0,
        },
      };
    } finally {
      abortController = null;
    }
  };

  /**
   * 현재 처리 중단
   */
  const cancelProcess = () => {
    abortController?.abort();
    setStep("idle", 0);
    updateState({
      error: "사용자에 의해 취소됨",
    });
  };

  /**
   * 상태 초기화
   */
  const reset = () => {
    abortController?.abort();
    currentProcessState = {
      currentStep: "idle",
      progress: 0,
      stepProgress: 0,
      completedCount: 0,
      totalCount: 0,
      retryCount: 0,
    };
    onStateChange?.(getState());
  };

  return {
    // 상태 관리
    getState,
    setOnStateChange,

    // 주요 기능
    processCSV,
    cancelProcess,
    reset,
  };
}

export type CsvService = ReturnType<typeof createCsvService>;
