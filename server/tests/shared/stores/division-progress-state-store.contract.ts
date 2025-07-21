import {
  DivisionProgressState,
  DivisionProgressStateStore,
} from "@/core/interfaces";

import { v4 as uuidv4 } from "uuid";

/**
 * DivisionProgressStateStore의 계약 테스트
 *
 * 이 테스트는 DivisionProgressStateStore 인터페이스를 구현하는 모든 클래스가
 * 준수해야 하는 기본 동작을 정의합니다.
 */
export function testDivisionProgressStateStoreContract(
  createStore: () => DivisionProgressStateStore,
  cleanup?: () => Promise<void>
) {
  describe("DivisionProgressStateStore 계약 테스트", () => {
    let store: DivisionProgressStateStore;

    beforeEach(async () => {
      // Arrange
      store = createStore();
    });

    afterEach(async () => {
      // Cleanup
      if (cleanup) {
        await cleanup();
      }
    });

    it("대회 부문의 진행 상태를 초기화할 수 있다", async () => {
      // Arrange
      const divisionId = uuidv4();
      const initialState: DivisionProgressState = {
        runnerId: "runner-1",
        participantOrder: ["runner-1", "runner-2", "runner-3"],
      };
      await store.setState(divisionId, initialState);

      // Act
      await store.resetState(divisionId);

      // Assert
      const result = await store.getState(divisionId);
      expect(result).toEqual({
        runnerId: null,
        participantOrder: [],
      });
    });

    it("존재하지 않는 대회 부문을 초기화해도 오류가 발생하지 않는다", async () => {
      // Arrange
      const divisionId = "non-existent-division";

      // Act & Assert
      await expect(store.resetState(divisionId)).resolves.not.toThrow();
    });

    it("대회 부문의 진행 상태를 설정할 수 있다", async () => {
      // Arrange
      const divisionId = uuidv4();
      const state: DivisionProgressState = {
        runnerId: "runner-1",
        participantOrder: ["runner-1", "runner-2"],
      };

      // Act
      await store.setState(divisionId, state);

      // Assert
      const result = await store.getState(divisionId);
      expect(result).toEqual(state);
    });

    it("기존 상태를 새로운 상태로 덮어쓸 수 있다", async () => {
      // Arrange
      const divisionId = uuidv4();
      const initialState: DivisionProgressState = {
        runnerId: "runner-1",
        participantOrder: ["runner-1"],
      };
      const newState: DivisionProgressState = {
        runnerId: "runner-2",
        participantOrder: ["runner-2", "runner-3"],
      };
      await store.setState(divisionId, initialState);

      // Act
      await store.setState(divisionId, newState);

      // Assert
      const result = await store.getState(divisionId);
      expect(result).toEqual(newState);
    });

    it("null 값들을 포함한 상태를 설정할 수 있다", async () => {
      // Arrange
      const divisionId = uuidv4();
      const state: DivisionProgressState = {
        runnerId: null,
        participantOrder: [],
      };

      // Act
      await store.setState(divisionId, state);

      // Assert
      const result = await store.getState(divisionId);
      expect(result).toEqual(state);
    });

    it("설정된 상태를 조회할 수 있다", async () => {
      // Arrange
      const divisionId = uuidv4();
      const state: DivisionProgressState = {
        runnerId: "runner-1",
        participantOrder: ["runner-1", "runner-2", "runner-3"],
      };
      await store.setState(divisionId, state);

      // Act
      const result = await store.getState(divisionId);

      // Assert
      expect(result).toEqual(state);
    });

    it("존재하지 않는 대회 부문의 경우 기본값을 반환한다", async () => {
      // Arrange
      const divisionId = "non-existent-division";

      // Act
      const result = await store.getState(divisionId);

      // Assert
      expect(result).toEqual({
        runnerId: null,
        participantOrder: [],
      });
    });

    it("여러 대회 부문의 상태를 독립적으로 관리할 수 있다", async () => {
      // Arrange
      const divisionId1 = uuidv4();
      const divisionId2 = uuidv4();
      const state1: DivisionProgressState = {
        runnerId: "runner-1",
        participantOrder: ["runner-1"],
      };
      const state2: DivisionProgressState = {
        runnerId: "runner-2",
        participantOrder: ["runner-2", "runner-3"],
      };

      // Act
      await store.setState(divisionId1, state1);
      await store.setState(divisionId2, state2);

      // Assert
      const result1 = await store.getState(divisionId1);
      const result2 = await store.getState(divisionId2);
      expect(result1).toEqual(state1);
      expect(result2).toEqual(state2);
    });
  });
}
