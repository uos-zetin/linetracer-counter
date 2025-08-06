import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  formatDate,
  formatDateShort,
  formatTime,
  formatTimeShort,
  formatDateTime,
  formatRelativeTime,
  formatDateTimeFull,
} from "../date-utils";

describe("Date Utils", () => {
  beforeEach(() => {
    // 시간대 관련 테스트의 일관성을 위해 고정된 시간으로 설정
    vi.setSystemTime(new Date("2024-01-15T14:30:25.000Z"));
  });

  describe("formatDate", () => {
    it("Date 객체를 한국 날짜 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T09:30:00.000Z");
      const result = formatDate(date);
      expect(result).toMatch(/2024년.*1월.*15일/);
    });

    it("ISO 문자열을 한국 날짜 형식으로 포맷팅해야 한다", () => {
      const result = formatDate("2024-01-15T09:30:00.000Z");
      expect(result).toMatch(/2024년.*1월.*15일/);
    });

    it("timestamp를 한국 날짜 형식으로 포맷팅해야 한다", () => {
      const timestamp = new Date("2024-01-15T09:30:00.000Z").getTime();
      const result = formatDate(timestamp);
      expect(result).toMatch(/2024년.*1월.*15일/);
    });
  });

  describe("formatDateShort", () => {
    it("YYYY.MM.DD 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T09:30:00.000Z");
      const result = formatDateShort(date);
      expect(result).toMatch(/2024\.\d{2}\.\d{2}/);
    });
  });

  describe("formatTime", () => {
    it("HH:MM:SS 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T14:30:25.000Z");
      const result = formatTime(date);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("formatTimeShort", () => {
    it("HH:MM 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T14:30:25.000Z");
      const result = formatTimeShort(date);
      expect(result).toMatch(/\d{2}:\d{2}/);
      expect(result).not.toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("formatDateTime", () => {
    it("YYYY.MM.DD HH:MM 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T14:30:25.000Z");
      const result = formatDateTime(date);
      expect(result).toMatch(/2024\.\d{2}\.\d{2} \d{2}:\d{2}/);
    });
  });

  describe("formatRelativeTime", () => {
    it("1분 미만이면 '방금 전'을 반환해야 한다", () => {
      const date = new Date("2024-01-15T14:30:00.000Z"); // 25초 전
      const result = formatRelativeTime(date);
      expect(result).toBe("방금 전");
    });

    it("1시간 미만이면 'N분 전'을 반환해야 한다", () => {
      const date = new Date("2024-01-15T14:15:25.000Z"); // 15분 전
      const result = formatRelativeTime(date);
      expect(result).toBe("15분 전");
    });

    it("24시간 미만이면 'N시간 전'을 반환해야 한다", () => {
      const date = new Date("2024-01-15T12:30:25.000Z"); // 2시간 전
      const result = formatRelativeTime(date);
      expect(result).toBe("2시간 전");
    });

    it("7일 미만이면 'N일 전'을 반환해야 한다", () => {
      const date = new Date("2024-01-13T14:30:25.000Z"); // 2일 전
      const result = formatRelativeTime(date);
      expect(result).toBe("2일 전");
    });

    it("7일 이상이면 짧은 날짜 형식을 반환해야 한다", () => {
      const date = new Date("2024-01-01T14:30:25.000Z"); // 14일 전
      const result = formatRelativeTime(date);
      expect(result).toMatch(/2024\.\d{2}\.\d{2}/);
    });
  });

  describe("formatDateTimeFull", () => {
    it("상세한 날짜시간 형식으로 포맷팅해야 한다", () => {
      const date = new Date("2024-01-15T14:30:25.000Z");
      const result = formatDateTimeFull(date);
      expect(result).toMatch(/2024년.*1월.*15일.*\d{2}:\d{2}:\d{2}/);
    });
  });
});