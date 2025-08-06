import { AuthDebugWrapper } from "@/features/auth";
import { AppHeader } from "@/widgets/app-header";
import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthDebugWrapper>
      <div className="min-h-screen bg-gray-50">
        <AppHeader title="관리자 페이지" showBackButton={true} backPath="/" />

        {/* Main Layout */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <AdminSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white shadow rounded-lg">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </AuthDebugWrapper>
  );
}
