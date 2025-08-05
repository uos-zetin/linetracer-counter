import type { Competition, CompetitionForm, CompetitionRepository } from "@/entities/competition";
import { CompetitionFormSchema, useZustandCompetitionStore } from "@/entities/competition";
import type { CompetitionService } from "./types";

interface CompetitionServiceProps {
  competitionRepository: CompetitionRepository;
}

export const createCompetitionService = ({
  competitionRepository,
}: CompetitionServiceProps): CompetitionService => {
  // 조회 기능 (공용)
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
      // Repository에서 조회
      const competition = await competitionRepository.getCompetitionById(id);

      // Store 업데이트 (존재하는 경우만)
      if (competition) {
        const store = useZustandCompetitionStore.getState();
        store.add(competition);
      }
    } catch (error) {
      console.error(`Failed to load competition by id ${id}:`, error);
      throw error;
    }
  };

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인됨)
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

  // Store 구독 메서드들 (공용)
  const useCompetitions = (): Competition[] => {
    return useZustandCompetitionStore((state) => state.competitions);
  };

  const useCompetitionById = (id: string): Competition | null => {
    const competition = useZustandCompetitionStore((state) => state.competitions.find((c) => c.id === id) ?? null);
    return competition;
  };

  return {
    // 조회 기능 (공용)
    loadAllCompetitions,
    loadCompetitionById,
    useCompetitions,
    useCompetitionById,

    // 관리 기능 (admin 전용)
    createCompetition,
    updateCompetition,
    deleteCompetition,
  };
};