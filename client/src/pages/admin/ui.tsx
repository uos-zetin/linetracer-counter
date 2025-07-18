import { AppHeader } from "@/widgets/app-header";

export function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="관리자 페이지" showBackButton={true} backPath="/" />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto py-[1.5vw] sm:px-[1.5vw] lg:px-[2vw]">
        <div className="px-[1vw] py-[1.5vw] sm:px-0">
          <div className="text-center">
            <h2 className="text-[4.5vw] sm:text-[4vw] md:text-[3vw] font-extrabold text-gray-900">관리자 기능</h2>
            <p className="mt-[0.75vw] max-w-2xl mx-auto text-[3vw] sm:text-[2.5vw] md:text-[2vw] text-gray-500 sm:mt-[1vw]">
              시스템 관리 기능들을 이용하세요
            </p>
          </div>

          <div className="mt-[2.5vw]">
            <div className="grid grid-cols-1 gap-[1.5vw] sm:grid-cols-2 lg:grid-cols-3">
              {/* 사용자 관리 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-[1vw] py-[1.25vw] sm:p-[1.5vw]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-[2vw] h-[2vw] bg-blue-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-[1.25vw] h-[1.25vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-[1.25vw] w-0 flex-1">
                      <dl>
                        <dt className="text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium text-gray-500 truncate">
                          사용자 관리
                        </dt>
                        <dd className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] font-medium text-gray-900">
                          사용자 계정 관리
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-[1vw]">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-[1vw] py-[0.5vw] rounded-md text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium w-full">
                      사용자 관리 (준비중)
                    </button>
                  </div>
                </div>
              </div>

              {/* 대회 관리 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-[1vw] py-[1.25vw] sm:p-[1.5vw]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-[2vw] h-[2vw] bg-green-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-[1.25vw] h-[1.25vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-[1.25vw] w-0 flex-1">
                      <dl>
                        <dt className="text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium text-gray-500 truncate">
                          대회 관리
                        </dt>
                        <dd className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] font-medium text-gray-900">
                          대회 설정 및 관리
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-[1vw]">
                    <button className="bg-green-600 hover:bg-green-700 text-white px-[1vw] py-[0.5vw] rounded-md text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium w-full">
                      대회 관리 (준비중)
                    </button>
                  </div>
                </div>
              </div>

              {/* 기록 관리 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-[1vw] py-[1.25vw] sm:p-[1.5vw]">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-[2vw] h-[2vw] bg-purple-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-[1.25vw] h-[1.25vw] text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-[1.25vw] w-0 flex-1">
                      <dl>
                        <dt className="text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium text-gray-500 truncate">
                          기록 관리
                        </dt>
                        <dd className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] font-medium text-gray-900">
                          기록 보기 및 분석
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-[1vw]">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-[1vw] py-[0.5vw] rounded-md text-[2vw] sm:text-[1.5vw] md:text-[1.25vw] font-medium w-full">
                      기록 관리 (준비중)
                    </button>
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
