interface ControllerLayoutProps {
  counterId: string;
  children?: React.ReactNode;
  className?: string;
}

export const ControllerLayout = ({ 
  counterId, 
  children,
  className = ""
}: ControllerLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Controller Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Counter ID: <span className="font-mono font-medium">{counterId}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {children}
        </div>
      </div>
    </div>
  );
};