import { Link, useLocation } from "react-router";
import { Trophy, List, Users, BarChart3, UserCog, LayoutDashboard } from "lucide-react";

const sidebarItems = [
  {
    name: "대회 관리",
    path: "/admin/competitions",
    icon: Trophy,
  },
  {
    name: "부문 관리",
    path: "/admin/divisions",
    icon: List,
  },
  {
    name: "참가자 관리",
    path: "/admin/participants",
    icon: Users,
  },
  {
    name: "기록 관리",
    path: "/admin/records",
    icon: BarChart3,
  },
  {
    name: "사용자 관리",
    path: "/admin/users",
    icon: UserCog,
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <nav className="bg-card shadow rounded-lg border">
      <div className="p-4">
        {/* 대시보드 버튼 */}
        <div className="mb-6">
          <Link
            to="/admin"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full min-h-[44px] ${
              location.pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            대시보드
          </Link>
        </div>

        {/* 구분선 */}
        <div className="border-t border-border mb-4"></div>

        <h3 className="text-lg font-medium text-foreground mb-4">관리 기능</h3>
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
