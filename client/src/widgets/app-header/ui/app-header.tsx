import { Link } from "react-router";
import { useUserStoreHook } from "@/entities/user";
import { logoutUser } from "@/features/auth";

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  showLogout?: boolean;
}

export function AppHeader({ title, showBackButton = false, backPath = "/", showLogout = true }: AppHeaderProps) {
  const userStoreHook = useUserStoreHook();
  const user = userStoreHook((state) => state.user);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-[1vw] sm:px-[1.5vw] lg:px-[2vw]">
        <div className="flex justify-between items-center py-[1vw]">
          <div className="flex items-center space-x-[1vw]">
            {showBackButton && (
              <Link
                to={backPath}
                className="text-gray-500 hover:text-gray-700 flex items-center transition-colors duration-200"
              >
                <svg
                  className="w-[1.25vw] h-[1.25vw] mr-[0.25vw]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-[3vw] sm:text-[2vw] md:text-[1.5vw]">뒤로</span>
              </Link>
            )}
            <h1 className="text-[4vw] sm:text-[3vw] md:text-[2.5vw] font-bold text-gray-900">{title}</h1>
          </div>
          <div className="flex items-center space-x-[1vw]">
            {user && (
              <span className="text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] text-gray-700">
                안녕하세요, {user.name}님
              </span>
            )}
            {showLogout && (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-[1vw] py-[0.5vw] rounded-md text-[2.5vw] sm:text-[2vw] md:text-[1.5vw] font-medium transition-colors duration-200"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
