export interface ParsedData {
  name: string;
  team: string;
  robotName: string;
  orderRaw: string;
  comment: string;
}

export interface GroupedData {
  divisionName: string;
  participants: ParsedData[];
}

export interface CsvParseResult {
  success: boolean;
  data?: ParsedData[];
  groupedData?: GroupedData[];
  competitionName?: string; // 추출된 대회명
  divisionNames?: string[]; // 추출된 부문명 목록
  error?: string;
}

export interface CsvValidationResult {
  isValid: boolean;
  missingHeaders?: string[];
  invalidRows?: number[];
}

// CSV 처리 상태 관련 타입들

export type CsvProcessStep = 
  | 'idle'
  | 'parsing'
  | 'validating'
  | 'creating_competition'
  | 'creating_divisions'
  | 'creating_participants'
  | 'completed'
  | 'error';

export interface CsvProcessState {
  /** 현재 처리 단계 */
  currentStep: CsvProcessStep;
  /** 전체 진행률 (0-100) */
  progress: number;
  /** 현재 단계 진행률 (0-100) */
  stepProgress: number;
  /** 현재 처리 중인 아이템 정보 */
  currentItem?: string;
  /** 처리 완료된 항목 수 */
  completedCount: number;
  /** 총 처리할 항목 수 */
  totalCount: number;
  /** 에러 메시지 */
  error?: string;
  /** 재시도 횟수 */
  retryCount: number;
}

export interface CreatedEntity {
  /** 엔티티 타입 */
  type: 'competition' | 'division' | 'participant';
  /** 엔티티 ID */
  id: string;
  /** 엔티티 이름 */
  name: string;
  /** 생성 시간 */
  createdAt: Date;
}

export interface DivisionSummary {
  /** 부문 이름 */
  divisionName: string;
  /** 첫 번째 참가자 이름 */
  firstParticipantName: string;
  /** 총 참가자 수 */
  totalParticipants: number;
}

export interface CsvProcessResult {
  /** 처리 성공 여부 */
  success: boolean;
  /** 생성된 엔티티들 */
  createdEntities: CreatedEntity[];
  /** 부문별 요약 정보 */
  divisionSummaries?: DivisionSummary[];
  /** 실패한 항목들 */
  failedItems: Array<{
    type: 'competition' | 'division' | 'participant';
    name: string;
    error: string;
  }>;
  /** 총 처리 시간 (밀리초) */
  processingTime: number;
  /** 처리한 파일 정보 */
  fileInfo: {
    name: string;
    size: number;
    rowCount: number;
  };
}

export interface DivisionSettings {
  /** 부문 이름 */
  divisionName: string;
  /** 부문 설명 */
  description?: string;
  /** 제한시간 (초 단위) */
  timeLimit?: number;
}

export interface CsvImportOptions {
  /** 대회 설명 */
  competitionDescription?: string;
  /** 부문별 설정 */
  divisionSettings?: DivisionSettings[];
}

export interface CsvImportContext {
  /** 현재 처리 상태 */
  state: CsvProcessState;
  /** 처리 결과 */
  result?: CsvProcessResult;
  /** CSV 파일 처리 시작 */
  startImport: (file: File, options?: CsvImportOptions) => Promise<void>;
  /** 처리 중단 */
  cancelImport: () => void;
  /** 상태 초기화 */
  reset: () => void;
}
