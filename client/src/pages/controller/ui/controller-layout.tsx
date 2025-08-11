import type { ReactNode } from "react";
import { AppHeader } from "@/widgets/app-header";

interface ControllerLayoutProps {
  children: ReactNode;
  counterId: string;
}

export const ControllerLayout = ({ children, counterId }: ControllerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader title={`Controller - ${counterId}`} showBackButton={true} backPath={`/counter`} showLogout={true} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">실시간 계수기 제어 및 모니터링</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">{children}</div>
      </main>
    </div>
  );
};
