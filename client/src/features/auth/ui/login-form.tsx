import { useState } from "react";
import { useUser } from "entities/user";
import { validateLoginForm } from "../lib/validation";
import type { LoginFormData } from "../types";

export function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    userName: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const userStore = useUser();
  const login = userStore((state) => state.login);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 입력 시 해당 필드 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    const validationResult = validateLoginForm(formData);
    if (!validationResult.isValid) {
      const errorMap = validationResult.errors.reduce(
        (acc, error) => {
          acc[error.field] = error.message;
          return acc;
        },
        {} as Record<string, string>,
      );
      setErrors(errorMap);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.userName, formData.password);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "로그인에 실패했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-[3vw] px-[1vw] sm:px-[1.5vw] lg:px-[2vw]">
      <div className="max-w-md w-full space-y-[2vw]">
        <div>
          <h2 className="mt-[1.5vw] text-center text-[5vw] sm:text-[4vw] md:text-[3vw] font-extrabold text-gray-900">
            로그인
          </h2>
          <p className="mt-[0.5vw] text-center text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] text-gray-600">
            계수기 시스템에 로그인하세요
          </p>
        </div>

        <form className="mt-[2vw] space-y-[1.5vw]" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="userName" className="sr-only">
                사용자명
              </label>
              <input
                id="userName"
                name="userName"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-[0.75vw] py-[0.5vw] border ${
                  errors.userName ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-[2.5vw] sm:text-[2vw] md:text-[1.5vw]`}
                placeholder="사용자명"
                value={formData.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                disabled={isLoading}
              />
              {errors.userName && (
                <p className="mt-[0.25vw] text-[2vw] sm:text-[1.5vw] md:text-[1vw] text-red-600">{errors.userName}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-[0.75vw] py-[0.5vw] border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-[2.5vw] sm:text-[2vw] md:text-[1.5vw]`}
                placeholder="비밀번호"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-[0.25vw] text-[2vw] sm:text-[1.5vw] md:text-[1vw] text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.general && (
            <div className="rounded-md bg-red-50 p-[1vw]">
              <div className="flex">
                <div className="ml-[0.75vw]">
                  <h3 className="text-[2vw] sm:text-[1.5vw] md:text-[1vw] font-medium text-red-800">
                    {errors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-[0.5vw] px-[1vw] border border-transparent text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
