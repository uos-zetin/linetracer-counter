import type { Division, DivisionForm, DivisionRepository } from "@/entities/division";
import { DivisionFormSchema, useZustandDivisionStore } from "@/entities/division";
import type { AdminDivisionService } from "./types";

interface AdminDivisionServiceProps {
  divisionRepository: DivisionRepository;
}

export const createAdminDivisionService = ({ divisionRepository }: AdminDivisionServiceProps): AdminDivisionService => {
  const loadAllDivisions = async (): Promise<void> => {
    try {
      // 모든 대회의 divisions를 가져오려면 각 대회별로 호출해야 함
      // 하지만 이 메서드는 사용하지 않을 예정이므로 빈 배열로 초기화
      const store = useZustandDivisionStore.getState();
      store.init([]);
    } catch (error) {
      console.error("Failed to load all divisions:", error);
      throw error;
    }
  };

  const loadDivisionsByCompetition = async (competitionId: string): Promise<void> => {
    try {
      const divisions = await divisionRepository.getAllDivisions(competitionId);

      // Store 업데이트 - 기존 divisions 중 해당 competition의 것들만 교체
      const store = useZustandDivisionStore.getState();
      const allDivisions = store.getAll();
      const otherDivisions = allDivisions.filter((d) => d.competitionId !== competitionId);
      const updatedDivisions = [...otherDivisions, ...divisions];

      store.init(updatedDivisions);
    } catch (error) {
      console.error(`Failed to load divisions for competition ${competitionId}:`, error);
      throw error;
    }
  };

  const loadDivisionById = async (id: string): Promise<void> => {
    try {
      // 먼저 Store에서 확인
      const store = useZustandDivisionStore.getState();
      const cachedDivision = store.getById(id);

      if (cachedDivision) {
        return; // 이미 Store에 있으면 바로 반환
      }

      // Store에 없으면 Repository에서 조회
      const division = await divisionRepository.getDivisionById(id);

      // Store 업데이트 (존재하는 경우만)
      if (division) {
        store.add(division);
      }
    } catch (error) {
      console.error(`Failed to load division by id ${id}:`, error);
      throw error;
    }
  };

  const createDivision = async (data: DivisionForm): Promise<void> => {
    try {
      const validatedData = DivisionFormSchema.parse(data);
      const newDivision = await divisionRepository.createDivision(validatedData);

      // Store 업데이트
      const store = useZustandDivisionStore.getState();
      store.add(newDivision);
    } catch (error) {
      console.error("Failed to create division:", error);
      throw error;
    }
  };

  const updateDivision = async (id: string, data: DivisionForm): Promise<void> => {
    try {
      const validatedData = DivisionFormSchema.parse(data);

      // 기존 division 정보를 가져와서 업데이트
      const store = useZustandDivisionStore.getState();
      const existingDivision = store.getById(id);

      if (!existingDivision) {
        throw new Error(`Division with id ${id} not found`);
      }

      // 기존 정보를 유지하면서 업데이트
      const updatedDivisionData: Division = {
        ...existingDivision,
        ...validatedData,
      };

      const updatedDivision = await divisionRepository.updateDivision(updatedDivisionData);

      // Store 업데이트
      if (updatedDivision) {
        store.update(updatedDivision);
      }
    } catch (error) {
      console.error(`Failed to update division ${id}:`, error);
      throw error;
    }
  };

  const deleteDivision = async (id: string): Promise<void> => {
    try {
      await divisionRepository.deleteDivision(id);

      // Store 업데이트
      const store = useZustandDivisionStore.getState();
      store.remove(id);
    } catch (error) {
      console.error(`Failed to delete division ${id}:`, error);
      throw error;
    }
  };

  // Store 구독 메서드들
  const useDivisions = (): Division[] => {
    return useZustandDivisionStore((state) => state.divisions);
  };

  const useDivisionsByCompetition = (competitionId: string): Division[] => {
    const allDivisions = useZustandDivisionStore((state) => state.divisions);

    // 빈 competitionId면 빈 배열 반환
    if (!competitionId) {
      return [];
    }

    // Service에서 필터링 및 정렬
    return allDivisions
      .filter((d) => d.competitionId === competitionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const useDivisionById = (id: string): Division | null => {
    return useZustandDivisionStore((state) => state.getById(id));
  };

  return {
    // Store state updates
    loadAllDivisions,
    loadDivisionsByCompetition,
    loadDivisionById,
    createDivision,
    updateDivision,
    deleteDivision,

    // Store 구독 메서드들
    useDivisions,
    useDivisionsByCompetition,
    useDivisionById,
  };
};
