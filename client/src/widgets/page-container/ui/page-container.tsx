import { cn } from "@/shared/lib";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "7xl";
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",     // 640px
  md: "max-w-screen-md",     // 768px
  lg: "max-w-screen-lg",     // 1024px
  xl: "max-w-screen-xl",     // 1280px
  "2xl": "max-w-screen-2xl", // 1536px
  "7xl": "max-w-7xl",        // 1280px (동일하지만 관례상 사용)
  full: "max-w-full",        // 제한 없음
} as const;

const paddingClasses = {
  none: "",
  sm: "px-2 sm:px-4",
  md: "px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16", 
  lg: "px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24",
} as const;

export function PageContainer({ 
  children, 
  className = "",
  maxWidth = "7xl",
  padding = "md" 
}: PageContainerProps) {
  return (
    <div 
      className={cn(
        // 기본 컨테이너 스타일
        "mx-auto w-full",
        // 최대 너비 설정
        maxWidthClasses[maxWidth],
        // 패딩 설정
        paddingClasses[padding],
        // 추가 클래스
        className
      )}
    >
      {children}
    </div>
  );
}