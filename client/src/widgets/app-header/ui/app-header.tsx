import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useAuthService } from "@/features/auth";

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  showLogout?: boolean;
}

export function AppHeader({ title, showBackButton = false, backPath = "/", showLogout = true }: AppHeaderProps) {
  const authService = useAuthService();
  const { user } = authService.useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center min-w-0 flex-1">
            {showBackButton && (
              <Link
                to={backPath}
                className="text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200 -ml-2 sm:-ml-3 lg:-ml-4 mr-2 sm:mr-4 flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm sm:text-base ml-1 hidden sm:inline">뒤로</span>
              </Link>
            )}
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {user && (
              <span className="text-sm sm:text-base text-gray-700 hidden sm:inline">안녕하세요, {user.name}님</span>
            )}
            {showLogout && (
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
                className="min-h-[44px] min-w-[44px] sm:min-h-[auto] sm:min-w-[auto] text-xs sm:text-sm px-2 sm:px-3"
              >
                로그아웃
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
