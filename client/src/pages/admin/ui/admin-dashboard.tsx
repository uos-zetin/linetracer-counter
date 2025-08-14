import { Link } from "react-router";
import { Card, CardContent, Alert, AlertDescription, Trophy, List, Users, BarChart3, UserCog, Info } from "@/shared/ui";

const adminCards = [
  {
    title: "대회 관리",
    description: "대회 설정 및 관리",
    path: "/admin/competitions",
    icon: Trophy,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "부문 관리",
    description: "경연 부문 설정",
    path: "/admin/divisions",
    icon: List,
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "참가자 관리",
    description: "참가자 등록 및 관리",
    path: "/admin/participants",
    icon: Users,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "기록 관리",
    description: "기록 보기 및 분석",
    path: "/admin/records",
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "사용자 관리",
    description: "사용자 계정 관리",
    path: "/admin/users",
    icon: UserCog,
    gradient: "from-red-500 to-red-600",
  },
];

export function AdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">관리자 대시보드</h1>
        <p className="mt-2 text-muted-foreground">시스템 관리 기능들을 이용하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Link key={card.path} to={card.path}>
              <Card
                className={`bg-gradient-to-r ${card.gradient} text-white hover:shadow-lg transition-all duration-200 border-0 cursor-pointer transform hover:scale-105`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <p className="text-sm text-white/80">{card.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Alert className="mt-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>관리 기능 사용법:</strong> 위의 카드를 클릭하거나 왼쪽 사이드바에서 원하는 관리 기능을 선택하여
          사용하세요.
        </AlertDescription>
      </Alert>
    </div>
  );
}
