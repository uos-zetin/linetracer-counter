// 폼 데이터 타입들
export interface LoginFormData {
  userName: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

// 검증 결과 타입들
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// 폼 상태 타입들 (페이지에서 사용)
export interface FormState<T> {
  data: T;
  isSubmitting: boolean;
  errors: ValidationError[];
}
