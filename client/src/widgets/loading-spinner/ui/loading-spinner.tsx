import { cn } from "@/shared/lib";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12", 
  xl: "w-16 h-16",
} as const;

const messageSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

export function LoadingSpinner({ 
  size = "md", 
  message = "Loading...", 
  className = "",
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {/* 스피너 애니메이션 */}
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
      
      {/* 메시지 */}
      {message && (
        <div className={cn(
          "font-medium text-gray-700",
          messageSizeClasses[size]
        )}>
          {message}
        </div>
      )}
    </div>
  );

  // 전체 화면 로딩
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  // 일반 로딩
  return spinnerContent;
}