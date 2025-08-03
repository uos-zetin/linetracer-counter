export interface Competition {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface CompetitionForm {
  name: string;
  description: string;
}

export interface CompetitionActions {
  init: (competitions: Competition[]) => void; // 대회 목록 초기화
  add: (competition: Competition) => void; // 대회 추가
  update: (competition: Competition) => void; // 대회 수정
  remove: (competitionId: string) => void; // 대회 삭제
  clearAll: () => void; // 모든 대회 초기화 (테스트용)
}

export interface CompetitionStore extends CompetitionActions {
  competitions: Competition[]; // 대회 상태를 저장하는 배열 (생성일시 역순 정렬)
}
