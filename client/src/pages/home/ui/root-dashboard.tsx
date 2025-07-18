import { Link } from "react-router";
import { AppHeader } from "@/widgets/app-header";
export function RootDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="계수기 시스템" showBackButton={false} />
      <main className="max-w-7xl mx-auto py-[1.5vw] sm:px-[1.5vw] lg:px-[2vw]">
        <div className="px-[1vw] py-[1.5vw] sm:px-0">
          <div className="text-center">
            <h2 className="text-[4.5vw] sm:text-[3.5vw] md:text-[3vw] font-extrabold text-gray-900">대시보드</h2>
            <p className="mt-[0.75vw] max-w-2xl mx-auto text-[3vw] sm:text-[2.5vw] md:text-[2vw] text-gray-500 sm:mt-[1vw]">
              원하는 기능을 선택하세요
            </p>
          </div>
          <div className="mt-[2.5vw]">
            <div className="grid grid-cols-1 gap-[1.5vw] sm:grid-cols-2 lg:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="px-[1vw] py-[1.25vw] sm:p-[1.5vw]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-[3vw] h-[3vw] bg-blue-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-[2vw] h-[2vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-[1.25vw] w-0 flex-1">
                      <h3 className="text-[3vw] sm:text-[2.5vw] md:text-[2vw] font-medium text-gray-900">
                        계수기 선택
                      </h3>
                      <p className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] text-gray-500">
                        타이머 시작 및 기록 관리
                      </p>
                    </div>
                  </div>
                  <div className="mt-[1.5vw]">
                    <Link
                      to="/counter"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-[0.75vw] px-[1vw] rounded-md text-center inline-block transition-colors duration-200 text-[2.5vw] sm:text-[2vw] md:text-[1.5vw]"
                    >
                      계수기 선택하기
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
                <div className="px-[1vw] py-[1.25vw] sm:p-[1.5vw]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-[3vw] h-[3vw] bg-green-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-[2vw] h-[2vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-[1.25vw] w-0 flex-1">
                      <h3 className="text-[3vw] sm:text-[2.5vw] md:text-[2vw] font-medium text-gray-900">
                        관리자 페이지
                      </h3>
                      <p className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] text-gray-500">시스템 관리 및 설정</p>
                    </div>
                  </div>
                  <div className="mt-[1.5vw]">
                    <Link
                      to="/admin"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-[0.75vw] px-[1vw] rounded-md text-center inline-block transition-colors duration-200 text-[2.5vw] sm:text-[2vw] md:text-[1.5vw]"
                    >
                      관리자 페이지 이동
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
