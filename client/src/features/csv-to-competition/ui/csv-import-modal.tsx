import { useState, useEffect, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui";
import { useCsvService } from "../model/context";
import type { CsvProcessStep, CsvProcessState, CsvProcessResult } from "../model/types";

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
  'parsing',
  'validating', 
  'creating_competition',
  'creating_divisions',
  'creating_participants',
  'completed'
];

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const csvService = useCsvService();
  const [state, setState] = useState<CsvProcessState>(csvService.getState());
  const [result, setResult] = useState<CsvProcessResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 상태 변경 구독
  useEffect(() => {
    csvService.setOnStateChange(setState);
  }, [csvService]);

  // 파일 처리
  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('CSV 파일만 업로드할 수 있습니다.');
      return;
    }

    try {
      const result = await csvService.processCSV(file);
      setResult(result);
      if (result.success && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('CSV 처리 중 오류:', error);
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
    if (state.currentStep !== 'idle' && state.currentStep !== 'completed' && state.currentStep !== 'error') {
      const confirmed = confirm('처리 중인 작업이 있습니다. 정말 닫으시겠습니까?');
      if (!confirmed) return;
      csvService.cancelProcess();
    }
    
    csvService.reset();
    setResult(null);
    onClose();
  };

  // 재시작 핸들러
  const handleRestart = () => {
    csvService.reset();
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProcessing = state.currentStep !== 'idle' && state.currentStep !== 'completed' && state.currentStep !== 'error';
  const isCompleted = state.currentStep === 'completed';
  const hasError = state.currentStep === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            CSV로 대회 데이터 등록
          </DialogTitle>
          <DialogDescription>
            CSV 파일을 업로드하여 대회, 부문, 참가자를 일괄 등록할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 파일 업로드 영역 */}
          {state.currentStep === 'idle' && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
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
              <p className="text-sm text-muted-foreground mb-4">
                파일을 이곳에 드래그하거나 클릭하여 선택하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* 진행상황 표시 */}
          {isProcessing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {STEP_LABELS[state.currentStep]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {state.progress.toFixed(0)}%
                  </span>
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
                      <span className={isActive ? 'font-medium' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}>
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
                  {state.retryCount > 0 && (
                    <span className="ml-2 text-orange-600">
                      (재시도: {state.retryCount}회)
                    </span>
                  )}
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
                <p><strong>처리 시간:</strong> {(result.processingTime / 1000).toFixed(1)}초</p>
                <p><strong>파일:</strong> {result.fileInfo.name} ({result.fileInfo.rowCount}행)</p>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">생성된 항목:</h4>
                  <div className="space-y-1 pl-4">
                    {result.createdEntities.map((entity, index) => (
                      <div key={index} className="text-sm">
                        • {entity.type === 'competition' ? '대회' : 
                           entity.type === 'division' ? '부문' : '참가자'}: {entity.name}
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
                <p className="text-sm text-destructive">
                  {state.error || '알 수 없는 오류가 발생했습니다.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {state.currentStep === 'idle' ? (
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
          ) : isProcessing ? (
            <>
              <Button variant="outline" onClick={() => csvService.cancelProcess()}>
                중단
              </Button>
            </>
          ) : isCompleted ? (
            <>
              <Button variant="outline" onClick={handleRestart}>
                다시 업로드
              </Button>
              <Button onClick={handleClose}>
                완료
              </Button>
            </>
          ) : hasError ? (
            <>
              <Button variant="outline" onClick={handleRestart}>
                다시 시도
              </Button>
              <Button onClick={handleClose}>
                닫기
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}