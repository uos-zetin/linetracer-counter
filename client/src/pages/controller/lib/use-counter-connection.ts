import { useEffect } from "react";
import { useCounterService } from "@/features/counter";
import { useErrorHandlingService } from "@/features/error-handling";

interface UseCounterConnectionOptions {
  counterId: string;
  isAuthorized: boolean;
  sessionKey: string | null;
}

/**
 * 계수기 연결/해제 로직을 담당하는 커스텀 훅
 */
export const useCounterConnection = ({ counterId, isAuthorized, sessionKey }: UseCounterConnectionOptions) => {
  const counterService = useCounterService();
  const errorHandler = useErrorHandlingService();

  useEffect(() => {
    // 권한이 있고 세션키가 준비되면 연결
    if (counterId && counterService && isAuthorized && sessionKey) {
      const connectCounter = async () => {
        try {
          await counterService.connection.connect(counterId);
          console.log(`Counter connected successfully: ${counterId}`);
        } catch (error) {
          errorHandler.handle(error as Error, `카운터 ${counterId} 연결에 실패했습니다`);
        }
      };

      connectCounter();

      // 컴포넌트 언마운트 시 연결 해제
      return () => {
        counterService.connection.disconnect(counterId).catch((error) => {
          console.error(`Failed to disconnect counter ${counterId}:`, error);
        });
      };
    }
  }, [counterId, counterService, isAuthorized, sessionKey, errorHandler]);
};