import type { Competition, CompetitionForm, CompetitionRepository } from "@/entities/competition";
import { CompetitionFormSchema, useZustandCompetitionStore } from "@/entities/competition";
import type { AdminCompetitionService } from "./types";

interface AdminCompetitionServiceProps {
  competitionRepository: CompetitionRepository;
}

export const createAdminCompetitionService = ({
  competitionRepository,
}: AdminCompetitionServiceProps): AdminCompetitionService => {
  const loadAllCompetitions = async (): Promise<void> => {
    try {
      const competitions = await competitionRepository.getAllCompetitions();
      
      // Store 업데이트
      const store = useZustandCompetitionStore.getState();
      store.init(competitions);
    } catch (error) {
      console.error("Failed to load all competitions:", error);
      throw error;
    }
  };

  const loadCompetitionById = async (id: string): Promise<void> => {
    try {
      // 먼저 Store에서 확인
      const store = useZustandCompetitionStore.getState();
      const cachedCompetition = store.getById(id);
      
      if (cachedCompetition) {
        return; // 이미 Store에 있으면 바로 반환
      }
      
      // Store에 없으면 Repository에서 조회
      const competition = await competitionRepository.getCompetitionById(id);
      
      // Store 업데이트 (존재하는 경우만)
      if (competition) {
        store.add(competition);
      }
    } catch (error) {
      console.error(`Failed to load competition by id ${id}:`, error);
      throw error;
    }
  };

  const createCompetition = async (data: CompetitionForm): Promise<void> => {
    try {
      const validatedData = CompetitionFormSchema.parse(data);
      const newCompetition = await competitionRepository.createCompetition(validatedData);
      
      // Store 업데이트
      const store = useZustandCompetitionStore.getState();
      store.add(newCompetition);
    } catch (error) {
      console.error("Failed to create competition:", error);
      throw error;
    }
  };

  const updateCompetition = async (id: string, data: CompetitionForm): Promise<void> => {
    try {
      const validatedData = CompetitionFormSchema.parse(data);
      const updatedCompetition = await competitionRepository.updateCompetition({ id, ...validatedData } as Competition);
      
      // Store 업데이트
      const store = useZustandCompetitionStore.getState();
      store.update(updatedCompetition);
    } catch (error) {
      console.error(`Failed to update competition ${id}:`, error);
      throw error;
    }
  };

  const deleteCompetition = async (id: string): Promise<void> => {
    try {
      await competitionRepository.deleteCompetition(id);
      
      // Store 업데이트
      const store = useZustandCompetitionStore.getState();
      store.remove(id);
    } catch (error) {
      console.error(`Failed to delete competition ${id}:`, error);
      throw error;
    }
  };

  // Store 구독 메서드들
  const useCompetitions = (): Competition[] => {
    return useZustandCompetitionStore((state) => state.competitions);
  };

  const useCompetitionById = (id: string): Competition | null => {
    return useZustandCompetitionStore((state) => state.getById(id));
  };

  return {
    // Store state updates
    loadAllCompetitions,
    loadCompetitionById,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    
    // Store 구독 메서드들
    useCompetitions,
    useCompetitionById,
  };
};