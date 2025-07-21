/**
 * 전역 Selector 타입 정의
 */
export type Selector<S> = <T>(
  selector: (state: S) => T, // 상태에서 특정 값을 선택하는 함수
  equality?: (a: T, b: T) => boolean, // 선택된 값의 동등성 비교 함수
) => T;
