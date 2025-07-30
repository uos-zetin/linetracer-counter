import { useParams } from "react-router";

export const useCounterId = (): string | null => {
  const { counterId } = useParams<{ counterId: string }>();
  
  if (!counterId) {
    return null;
  }
  
  // Basic validation - counterId should be a non-empty string
  if (typeof counterId !== 'string' || counterId.trim().length === 0) {
    return null;
  }
  
  return counterId.trim();
};