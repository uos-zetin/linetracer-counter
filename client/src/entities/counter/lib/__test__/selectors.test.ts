import { describe, expect, it } from "vitest";
import { isRunning, getElapsedMs } from "../selectors";

describe("Counter Selectors", () => {
  describe("isRunning", () => {
    it("카운터가 실행 중일 때 true를 반환해야 한다", () => {
      // Arrange
      const startedAt = Date.now() - 5000;
      const stoppedAt = null;

      // Act
      const result = isRunning(startedAt, stoppedAt);

      // Assert
      expect(result).toBe(true);
    });

    it("카운터가 정지되었을 때 false를 반환해야 한다", () => {
      // Arrange
      const startedAt = Date.now() - 5000;
      const stoppedAt = Date.now();

      // Act
      const result = isRunning(startedAt, stoppedAt);

      // Assert
      expect(result).toBe(false);
    });

    it("카운터가 시작되지 않았을 때 false를 반환해야 한다", () => {
      // Arrange
      const startedAt = null;
      const stoppedAt = null;

      // Act
      const result = isRunning(startedAt, stoppedAt);

      // Assert
      expect(result).toBe(false);
    });

    it("두 타임스탬프가 모두 null일 때 false를 반환해야 한다", () => {
      // Arrange
      const startedAt = null;
      const stoppedAt = null;

      // Act
      const result = isRunning(startedAt, stoppedAt);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getElapsedMs", () => {
    it("종료 시간이 주어졌을 때 경과 시간을 계산해야 한다", () => {
      // Arrange
      const startedAt = 1000;
      const endTime = 6000;

      // Act
      const result = getElapsedMs(startedAt, endTime);

      // Assert
      expect(result).toBe(5000);
    });

    it("시작 시간이 null일 때 0을 반환해야 한다", () => {
      // Arrange
      const startedAt = null;
      const endTime = 6000;

      // Act
      const result = getElapsedMs(startedAt, endTime);

      // Assert
      expect(result).toBe(0);
    });

    it("종료 시간이 null일 때 현재 시간 기준으로 경과 시간을 계산해야 한다", () => {
      // Arrange
      const startedAt = 1000;
      const endTime = null;
      const now = Date.now();

      // Act
      const result = getElapsedMs(startedAt, endTime);

      // Assert
      expect(result).toBeGreaterThanOrEqual(now - startedAt - 1000); // 약간의 오차 허용
      expect(result).toBeLessThanOrEqual(now - startedAt + 1000);
    });

    it("두 시간이 모두 null일 때 0을 반환해야 한다", () => {
      // Arrange
      const startedAt = null;
      const endTime = null;

      // Act
      const result = getElapsedMs(startedAt, endTime);

      // Assert
      expect(result).toBe(0);
    });

    it("종료 시간이 시작 시간보다 이를 때 0을 반환해야 한다", () => {
      // Arrange
      const startedAt = 6000;
      const endTime = 1000; // 시작 시간보다 이른 종료 시간

      // Act
      const result = getElapsedMs(startedAt, endTime);

      // Assert
      expect(result).toBe(0); // Math.max(0, stop - start) 때문에 0 반환
    });
  });
});
