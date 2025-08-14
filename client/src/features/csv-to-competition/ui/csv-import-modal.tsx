import { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Settings } from "lucide-react";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
  Textarea,
} from "@/shared/ui";
import { CompetitionFormSchema } from "@/entities/competition";
import { DivisionFormSchema, MAX_TIMELIMIT } from "@/entities/division";
import { parseCsvFile } from "../lib/parse-csv";
import { useCsvService } from "../model/context";
import type {
  CsvProcessStep,
  CsvProcessState,
  CsvProcessResult,
  CsvParseResult,
  CsvImportOptions,
} from "../model/types";

// 폼 스키마 정의 - entity validation 기반
const competitionConfigSchema = z.object({
  competitionDescription: CompetitionFormSchema.shape.description.optional(),
});

const divisionSettingsSchema = z.object({
  divisionName: DivisionFormSchema.shape.name,
  description: DivisionFormSchema.shape.description.optional(),
  timeLimit: z.string(),
});

type CompetitionConfigForm = z.infer<typeof competitionConfigSchema>;

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (result: CsvProcessResult) => void;
}

const STEP_LABELS: Record<CsvProcessStep, string> = {
  idle: "대기 중",
  parsing: "CSV 파싱 중",
  validating: "데이터 검증 중",
  creating_competition: "대회 생성 중",
  creating_divisions: "부문 생성 중",
  creating_participants: "참가자 등록 중",
  completed: "완료",
  error: "오류 발생",
};

const STEP_ORDER: CsvProcessStep[] = [
  "parsing",
  "validating",
  "creating_competition",
  "creating_divisions",
  "creating_participants",
  "completed",
];

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const csvService = useCsvService();
  const [state, setState] = useState<CsvProcessState>(csvService.getState());
  const [result, setResult] = useState<CsvProcessResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV 파싱 관련 상태
  const [csvParseResult, setCsvParseResult] = useState<CsvParseResult | null>(null);
  const [currentStep, setCurrentStep] = useState<"upload" | "competition-config" | "division-config" | "processing">(
    "upload"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 사용자 입력 상태 - react-hook-form 사용
  const competitionForm = useForm<CompetitionConfigForm>({
    resolver: zodResolver(competitionConfigSchema),
    defaultValues: {
      competitionDescription: "",
    },
  });

  const divisionForm = useForm<{
    divisionSettings: {
      divisionName: string;
      description?: string;
      timeLimit: string;
    }[];
  }>({
    resolver: zodResolver(
      z.object({
        divisionSettings: z.array(divisionSettingsSchema),
      })
    ),
    defaultValues: {
      divisionSettings: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: divisionForm.control,
    name: "divisionSettings",
  });

  // 상태 변경 구독
  useEffect(() => {
    csvService.setOnStateChange(setState);
  }, [csvService]);

  // 파일 처리 (1단계: 파싱만)
  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("CSV 파일만 업로드할 수 있습니다.");
      return;
    }

    try {
      // CSV 파일을 파싱하여 부문 목록 추출
      const parseResult = await parseCsvFile(file);

      if (!parseResult.success || !parseResult.divisionNames) {
        alert(parseResult.error || "CSV 파싱에 실패했습니다.");
        return;
      }

      setCsvParseResult(parseResult);
      setSelectedFile(file); // 원본 파일 저장

      // 부문별 기본 설정 초기화
      const initialDivisionSettings = parseResult.divisionNames.map((name) => ({
        divisionName: name,
        description: "",
        timeLimit: "240", // 기본 4분 (문자열)
      }));

      // react-hook-form에 초기값 설정
      replace(initialDivisionSettings);
      setCurrentStep("competition-config");
    } catch (error) {
      console.error("CSV 파싱 중 오류:", error);
      alert("CSV 파일 처리 중 오류가 발생했습니다.");
    }
  };

  // 실제 업로드 처리 (4단계: 서버에 전송)
  const handleStartImport = async () => {
    if (!selectedFile) return;

    // 폼 데이터 수집
    const competitionData = competitionForm.getValues();
    const divisionData = divisionForm.getValues();

    // divisionSettings의 timeLimit을 string에서 number로 변환 및 validation 적용
    const processedDivisionSettings = divisionData.divisionSettings.map((setting) => {
      const timeLimit = parseInt(setting.timeLimit, 10) || 240;

      // entity validation 적용
      const validatedTimeLimit = Math.max(1, Math.min(MAX_TIMELIMIT, timeLimit));

      return {
        ...setting,
        description: setting.description || "", // 빈 값이면 빈 문자열로 설정
        timeLimit: validatedTimeLimit,
      };
    });

    const options: CsvImportOptions = {
      competitionDescription: competitionData.competitionDescription || undefined,
      divisionSettings: processedDivisionSettings.length > 0 ? processedDivisionSettings : undefined,
    };

    setCurrentStep("processing");

    try {
      const result = await csvService.processCSV(selectedFile, options);
      setResult(result);
      if (result.success && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("CSV 처리 중 오류:", error);
    }
  };

  // 드래그앤드롭 핸들러
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    if (currentStep === "processing" && state.currentStep !== "completed" && state.currentStep !== "error") {
      const confirmed = confirm("처리 중인 작업이 있습니다. 정말 닫으시겠습니까?");
      if (!confirmed) return;
      csvService.cancelProcess();
    }

    // 상태 초기화
    csvService.reset();
    setResult(null);
    setCsvParseResult(null);
    setSelectedFile(null);
    setCurrentStep("upload");
    competitionForm.reset();
    divisionForm.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  // 재시작 핸들러
  const handleRestart = () => {
    csvService.reset();
    setResult(null);
    setCsvParseResult(null);
    setSelectedFile(null);
    setCurrentStep("upload");
    competitionForm.reset();
    divisionForm.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (currentStep === "competition-config") {
      setCurrentStep("division-config");
    }
  };

  // 이전 단계로 돌아가기
  const handleBack = () => {
    if (currentStep === "competition-config") {
      setCurrentStep("upload");
      setCsvParseResult(null);
      setSelectedFile(null);
    } else if (currentStep === "division-config") {
      setCurrentStep("competition-config");
    }
  };

  const isProcessing =
    state.currentStep !== "idle" && state.currentStep !== "completed" && state.currentStep !== "error";
  const isCompleted = state.currentStep === "completed";
  const hasError = state.currentStep === "error";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {currentStep === "upload" && "CSV 파일 업로드"}
            {currentStep === "competition-config" && "대회 정보 설정"}
            {currentStep === "division-config" && "부문별 설정"}
            {currentStep === "processing" && "데이터 처리 중"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "upload" && "CSV 파일을 업로드하여 대회, 부문, 참가자를 일괄 등록할 수 있습니다."}
            {currentStep === "competition-config" && "대회에 대한 기본 정보를 설정하세요."}
            {currentStep === "division-config" && "각 부문에 대한 세부 설정을 입력하세요."}
            {currentStep === "processing" && "CSV 데이터를 서버로 전송하여 등록 중입니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 1단계: 파일 업로드 영역 */}
          {currentStep === "upload" && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                }
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="CSV 파일 업로드"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">CSV 파일 업로드</h3>
              <p className="text-sm text-muted-foreground mb-4">파일을 이곳에 드래그하거나 클릭하여 선택하세요</p>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
            </div>
          )}

          {/* 2단계: 대회 설정 입력 */}
          {currentStep === "competition-config" && csvParseResult && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">파싱 결과</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• 대회명: {csvParseResult.competitionName}</p>
                  <p>• 참가자 수: {csvParseResult.data?.length || 0}명</p>
                  <p>• 부문 수: {csvParseResult.divisionNames?.length || 0}개</p>
                  <p>• 부문: {csvParseResult.divisionNames?.join(", ")}</p>
                </div>
              </div>

              {/* 대회 설명 입력 */}
              <div className="space-y-2">
                <Label htmlFor="competition-description">대회 설명 (선택사항)</Label>
                <Textarea
                  id="competition-description"
                  placeholder="대회에 대한 설명을 입력하세요..."
                  {...competitionForm.register("competitionDescription")}
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* 3단계: 부문별 설정 입력 */}
          {currentStep === "division-config" && csvParseResult && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">부문별 설정</h3>
                <p className="text-sm text-muted-foreground">
                  각 부문에 대한 세부 설정을 입력하세요. (모든 항목은 선택사항입니다)
                </p>
              </div>

              {/* 부문별 설정 */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <h5 className="font-medium text-sm">
                      <Settings className="w-4 h-4 inline mr-2" />
                      {field.divisionName}
                    </h5>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor={`division-desc-${index}`}>부문 설명</Label>
                        <Input
                          id={`division-desc-${index}`}
                          placeholder="부문 설명을 입력하세요..."
                          {...divisionForm.register(`divisionSettings.${index}.description`)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`division-time-${index}`}>제한시간 (초)</Label>
                        <Input
                          id={`division-time-${index}`}
                          type="text"
                          placeholder="240"
                          {...divisionForm.register(`divisionSettings.${index}.timeLimit`)}
                          onInput={(e) => {
                            // 숫자만 입력 허용 (빈 문자열도 허용)
                            const target = e.target as HTMLInputElement;
                            const value = target.value;

                            // 숫자가 아닌 문자가 입력되면 제거
                            if (value && !/^\d+$/.test(value)) {
                              const cleanValue = value.replace(/\D/g, "");
                              target.value = cleanValue;
                              divisionForm.setValue(`divisionSettings.${index}.timeLimit`, cleanValue);
                            }

                            // 최대값 체크
                            const numValue = parseInt(value, 10);
                            if (numValue > MAX_TIMELIMIT) {
                              target.value = MAX_TIMELIMIT.toString();
                              divisionForm.setValue(`divisionSettings.${index}.timeLimit`, MAX_TIMELIMIT.toString());
                            }
                          }}
                          onBlur={(e) => {
                            // 포커스를 잃을 때 빈 값이면 기본값으로 설정
                            const value = e.target.value;
                            if (value === "") {
                              divisionForm.setValue(`divisionSettings.${index}.timeLimit`, "240");
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          1초 ~ {MAX_TIMELIMIT}초(99분 59초) 범위에서 입력하세요
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4단계: 진행상황 표시 */}
          {currentStep === "processing" && isProcessing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{STEP_LABELS[state.currentStep]}</span>
                  <span className="text-sm text-muted-foreground">{state.progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
              </div>

              {/* 단계별 진행 표시 */}
              <div className="space-y-2">
                {STEP_ORDER.map((step, index) => {
                  const currentIndex = STEP_ORDER.indexOf(state.currentStep);
                  const isActive = index === currentIndex;
                  const isCompleted = index < currentIndex;

                  return (
                    <div key={step} className="flex items-center gap-2 text-sm">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isActive ? (
                        <div className="w-4 h-4 border-2 border-primary rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-4 h-4 border border-muted-foreground rounded-full" />
                      )}
                      <span
                        className={isActive ? "font-medium" : isCompleted ? "text-green-600" : "text-muted-foreground"}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* 현재 작업 정보 */}
              {state.currentItem && (
                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  {state.currentItem}
                  {state.retryCount > 0 && <span className="ml-2 text-orange-600">(재시도: {state.retryCount}회)</span>}
                </div>
              )}
            </div>
          )}

          {/* 완료 결과 */}
          {isCompleted && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-lg font-medium">등록 완료!</h3>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>처리 시간:</strong> {(result.processingTime / 1000).toFixed(1)}초
                </p>
                <p>
                  <strong>파일:</strong> {result.fileInfo.name} ({result.fileInfo.rowCount}행)
                </p>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">생성된 항목:</h4>
                  <div className="space-y-2 pl-4">
                    {/* 대회 표시 */}
                    {result.createdEntities
                      .filter((entity) => entity.type === "competition")
                      .map((entity, index) => (
                        <div key={index} className="text-sm">
                          • <span className="font-medium">대회:</span> {entity.name}
                        </div>
                      ))}

                    {/* 부문별 참가자 요약 표시 */}
                    {result.divisionSummaries?.map((summary, index) => (
                      <div key={index} className="text-sm">
                        • <span className="font-medium">부문:</span> {summary.divisionName}
                        <div className="ml-4 text-xs text-muted-foreground mt-1">
                          {summary.totalParticipants > 0 ? (
                            <>
                              첫 번째 참가자: {summary.firstParticipantName}
                              {summary.totalParticipants > 1 && ` 외 ${summary.totalParticipants - 1}명`}
                              <span className="ml-2">(총 {summary.totalParticipants}명)</span>
                            </>
                          ) : (
                            "참가자 없음"
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 에러 표시 */}
          {hasError && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <h3 className="text-lg font-medium">처리 실패</h3>
              </div>

              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{state.error || "알 수 없는 오류가 발생했습니다."}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {/* 1단계: 파일 업로드 */}
          {currentStep === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
          )}

          {/* 2단계: 대회 설정 입력 */}
          {currentStep === "competition-config" && (
            <>
              <Button variant="outline" onClick={handleBack}>
                이전
              </Button>
              <Button onClick={handleNext}>다음</Button>
            </>
          )}

          {/* 3단계: 부문 설정 입력 */}
          {currentStep === "division-config" && (
            <>
              <Button variant="outline" onClick={handleBack}>
                이전
              </Button>
              <Button onClick={handleStartImport}>업로드 시작</Button>
            </>
          )}

          {/* 4단계: 처리 중 */}
          {currentStep === "processing" && isProcessing && (
            <Button variant="outline" onClick={() => csvService.cancelProcess()}>
              중단
            </Button>
          )}

          {/* 처리 완료 */}
          {currentStep === "processing" && isCompleted && (
            <>
              <Button variant="outline" onClick={handleRestart}>
                다시 업로드
              </Button>
              <Button onClick={handleClose}>완료</Button>
            </>
          )}

          {/* 처리 실패 */}
          {currentStep === "processing" && hasError && (
            <>
              <Button variant="outline" onClick={handleRestart}>
                다시 시도
              </Button>
              <Button onClick={handleClose}>닫기</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
