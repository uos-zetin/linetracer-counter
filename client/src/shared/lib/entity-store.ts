/**
 * Entity Store 공통 Actions 인터페이스
 * 모든 entity store에서 공통적으로 사용되는 CRUD 액션들을 정의합니다.
 */
export interface BaseEntityActions<T, TId = string> {
  /** 엔티티 목록 초기화 */
  init: (entities: T[]) => void;
  
  /** 새 엔티티 추가 */
  add: (entity: T) => void;
  
  /** 기존 엔티티 업데이트 */
  update: (entity: T) => void;
  
  /** 엔티티 제거 */
  remove: (entityId: TId) => void;
  
  /** 모든 엔티티 초기화 (선택적, 주로 테스트용) */
  clearAll?: () => void;
}

/**
 * 배열 기반 Entity Store 인터페이스
 * 대부분의 entity store에서 사용되는 기본 구조입니다.
 */
export interface BaseEntityStore<T, TId = string> extends BaseEntityActions<T, TId> {
  /** 엔티티 목록 */
  entities: T[];
}