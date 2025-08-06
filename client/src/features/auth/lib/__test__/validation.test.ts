import { describe, it, expect, vi } from "vitest";
import {
  SessionCredentialSchema,
  LoginInputSchema,
  RegisterInputSchema,
  parseSessionCredential,
  validateLoginInput,
  validateRegisterInput,
} from "../validation";

describe("Auth Validation", () => {
  describe("SessionCredentialSchema", () => {
    it("유효한 세션 데이터를 성공적으로 파싱해야 한다", () => {
      // Arrange
      const validSession = {
        sessionKey: "valid-session-key-123",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      // Act
      const result = SessionCredentialSchema.parse(validSession);

      // Assert
      expect(result).toEqual(validSession);
    });

    it("빈 sessionKey일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidSession = {
        sessionKey: "",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      // Act & Assert
      expect(() => SessionCredentialSchema.parse(invalidSession)).toThrow();
    });

    it("음수 expiresAt일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidSession = {
        sessionKey: "valid-key",
        expiresAt: -1000,
      };

      // Act & Assert
      expect(() => SessionCredentialSchema.parse(invalidSession)).toThrow();
    });

    it("필수 필드가 누락되었을 때 에러를 던져야 한다", () => {
      // Arrange
      const incompleteSession = {
        sessionKey: "valid-key",
        // expiresAt 누락
      };

      // Act & Assert
      expect(() => SessionCredentialSchema.parse(incompleteSession)).toThrow();
    });
  });

  describe("parseSessionCredential", () => {
    it("유효한 세션 데이터를 파싱해야 한다", () => {
      // Arrange
      const validSession = {
        sessionKey: "valid-session-key-123",
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };

      // Act
      const result = parseSessionCredential(validSession);

      // Assert
      expect(result).toEqual(validSession);
    });

    it("잘못된 세션 데이터일 때 null을 반환해야 한다", () => {
      // Arrange
      const invalidSession = {
        sessionKey: "",
        expiresAt: "invalid-date",
      };

      // Suppress console output for this test
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      const result = parseSessionCredential(invalidSession);

      // Assert
      expect(result).toBeNull();

      // Restore console
      consoleSpy.mockRestore();
    });

    it("null 입력일 때 null을 반환해야 한다", () => {
      // Suppress console output for this test
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Act
      const result = parseSessionCredential(null);

      // Assert
      expect(result).toBeNull();

      // Restore console
      consoleSpy.mockRestore();
    });
  });

  describe("LoginInputSchema", () => {
    it("유효한 로그인 입력을 성공적으로 파싱해야 한다", () => {
      // Arrange
      const validInput = {
        userName: "testuser",
        password: "password123",
      };

      // Act
      const result = LoginInputSchema.parse(validInput);

      // Assert
      expect(result).toEqual(validInput);
    });

    it("빈 사용자명일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        userName: "",
        password: "password123",
      };

      // Act & Assert
      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });

    it("너무 긴 사용자명일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        userName: "a".repeat(51), // 51자
        password: "password123",
      };

      // Act & Assert
      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });

    it("짧은 비밀번호일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        userName: "testuser",
        password: "12345", // 5자
      };

      // Act & Assert
      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });

    it("너무 긴 비밀번호일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        userName: "testuser",
        password: "a".repeat(101), // 101자
      };

      // Act & Assert
      expect(() => LoginInputSchema.parse(invalidInput)).toThrow();
    });
  });

  describe("validateLoginInput", () => {
    it("유효한 입력을 검증해야 한다", () => {
      // Arrange
      const validInput = {
        userName: "testuser",
        password: "password123",
      };

      // Act
      const result = validateLoginInput(validInput);

      // Assert
      expect(result).toEqual(validInput);
    });

    it("잘못된 입력일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        userName: "",
        password: "pass",
      };

      // Act & Assert
      expect(() => validateLoginInput(invalidInput)).toThrow();
    });
  });

  describe("RegisterInputSchema", () => {
    it("유효한 회원가입 입력을 성공적으로 파싱해야 한다", () => {
      // Arrange
      const validInput = {
        name: "홍길동",
        userName: "testuser",
        password: "password123",
      };

      // Act
      const result = RegisterInputSchema.parse(validInput);

      // Assert
      expect(result).toEqual(validInput);
    });

    it("빈 이름일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        name: "",
        userName: "testuser",
        password: "password123",
      };

      // Act & Assert
      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow();
    });

    it("너무 긴 이름일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        name: "가".repeat(101), // 101자
        userName: "testuser",
        password: "password123",
      };

      // Act & Assert
      expect(() => RegisterInputSchema.parse(invalidInput)).toThrow();
    });
  });

  describe("validateRegisterInput", () => {
    it("유효한 입력을 검증해야 한다", () => {
      // Arrange
      const validInput = {
        name: "홍길동",
        userName: "testuser",
        password: "password123",
      };

      // Act
      const result = validateRegisterInput(validInput);

      // Assert
      expect(result).toEqual(validInput);
    });

    it("잘못된 입력일 때 에러를 던져야 한다", () => {
      // Arrange
      const invalidInput = {
        name: "",
        userName: "testuser",
        password: "pass",
      };

      // Act & Assert
      expect(() => validateRegisterInput(invalidInput)).toThrow();
    });
  });
});
