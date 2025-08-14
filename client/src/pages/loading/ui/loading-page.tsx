import { LoadingSpinner } from "@/widgets/loading-spinner";

interface LoadingPageProps {
  message?: string;
}

export function LoadingPage({ 
  message = "페이지를 불러오고 있습니다..." 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8 max-w-md w-full">
        {/* 기존 LoadingSpinner widget 사용 - 반응형 크기 */}
        <div className="flex justify-center">
          <LoadingSpinner 
            size="lg" 
            message=""
            className="sm:scale-125"
          />
        </div>
        
        {/* 추가 메시지 - 반응형 텍스트 크기 */}
        <div className="space-y-2 sm:space-y-3">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            잠시만 기다려주세요
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* 장식용 도트 애니메이션 - 반응형 크기 */}
        <div className="flex justify-center space-x-1 sm:space-x-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}