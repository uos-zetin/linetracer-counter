import type { ReactNode } from 'react';

interface ControllerLayoutProps {
  children: ReactNode;
  counterId: string;
}

export const ControllerLayout = ({ children, counterId }: ControllerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Controller - Counter {counterId}
          </h1>
          <p className="mt-2 text-gray-600">
            실시간 카운터 제어 및 모니터링
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};