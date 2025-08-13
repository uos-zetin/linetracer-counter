import type { ReactNode } from "react";
import { AppHeader } from "@/widgets/app-header";
import { PageContainer } from "@/widgets/page-container";

interface ControllerLayoutProps {
  children: ReactNode;
  counterId: string;
}

export const ControllerLayout = ({ children, counterId }: ControllerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppHeader title={`Controller - ${counterId}`} showBackButton={true} backPath={`/counter`} showLogout={true} />

      <main className="py-8 xl:py-12 2xl:py-16">
        <PageContainer maxWidth="full" padding="md">
          <div className="mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-muted-foreground">실시간 계수기 제어 및 모니터링</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
            {children}
          </div>
        </PageContainer>
      </main>
    </div>
  );
};
