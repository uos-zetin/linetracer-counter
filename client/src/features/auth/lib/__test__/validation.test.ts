import { describe, it, expect } from "vitest";

import {
  validateLoginForm,
  validateRegisterForm,
  validateUserName,
  validatePassword,
  validateName,
  validateEmail,
} from "../validation";
import type { LoginFormData, RegisterFormData } from "../../types";

describe("Auth Validation with Zod", () => {
  describe("validateUserName", () => {
    it("should pass valid userName", () => {
      const result = validateUserName("test_user-123");
      expect(result).toBeNull();
    });

    it("should fail with empty userName", () => {
      const result = validateUserName("");
      expect(result).toEqual({
        field: "userName",
        message: "사용자명을 입력해주세요.",
      });
    });

    it("should fail with too short userName", () => {
      const result = validateUserName("ab");
      expect(result).toEqual({
        field: "userName",
        message: "사용자명은 3자 이상이어야 합니다.",
      });
    });

    it("should fail with invalid characters", () => {
      const result = validateUserName("user@name");
      expect(result).toEqual({
        field: "userName",
        message: "사용자명은 영문, 숫자, -, _ 만 사용할 수 있습니다.",
      });
    });
  });

  describe("validatePassword", () => {
    it("should pass valid password", () => {
      const result = validatePassword("password123");
      expect(result).toBeNull();
    });

    it("should fail with empty password", () => {
      const result = validatePassword("");
      expect(result).toEqual({
        field: "password",
        message: "비밀번호를 입력해주세요.",
      });
    });

    it("should fail with too short password", () => {
      const result = validatePassword("12345");
      expect(result).toEqual({
        field: "password",
        message: "비밀번호는 6자 이상이어야 합니다.",
      });
    });
  });

  describe("validateName", () => {
    it("should pass valid name", () => {
      const result = validateName("홍길동");
      expect(result).toBeNull();
    });

    it("should fail with empty name", () => {
      const result = validateName("");
      expect(result).toEqual({
        field: "name",
        message: "이름을 입력해주세요.",
      });
    });

    it("should trim whitespace", () => {
      const result = validateName("  홍길동  ");
      expect(result).toBeNull();
    });
  });

  describe("validateEmail", () => {
    it("should pass valid email", () => {
      const result = validateEmail("test@example.com");
      expect(result).toBeNull();
    });

    it("should fail with invalid email", () => {
      const result = validateEmail("invalid-email");
      expect(result).toEqual({
        field: "email",
        message: "올바른 이메일 형식을 입력해주세요.",
      });
    });
  });

  describe("validateLoginForm", () => {
    it("should pass valid login form", () => {
      const formData: LoginFormData = {
        userName: "testuser",
        password: "password123",
      };

      const result = validateLoginForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail with invalid login form", () => {
      const formData: LoginFormData = {
        userName: "ab", // too short
        password: "123", // too short
      };

      const result = validateLoginForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe("userName");
      expect(result.errors[1].field).toBe("password");
    });
  });

  describe("validateRegisterForm", () => {
    it("should pass valid register form", () => {
      const formData: RegisterFormData = {
        name: "홍길동",
        userName: "testuser",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = validateRegisterForm(formData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should fail when passwords don't match", () => {
      const formData: RegisterFormData = {
        name: "홍길동",
        userName: "testuser",
        password: "password123",
        confirmPassword: "different",
      };

      const result = validateRegisterForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe("confirmPassword");
      expect(result.errors[0].message).toBe("비밀번호가 일치하지 않습니다.");
    });

    it("should fail with multiple validation errors", () => {
      const formData: RegisterFormData = {
        name: "", // empty
        userName: "ab", // too short
        password: "123", // too short
        confirmPassword: "456", // doesn't match
      };

      const result = validateRegisterForm(formData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
