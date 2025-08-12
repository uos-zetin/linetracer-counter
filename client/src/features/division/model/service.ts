import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import type { Division, DivisionForm, DivisionRepository } from "@/entities/division";
import { DivisionFormSchema, useZustandDivisionStore } from "@/entities/division";
import type { DivisionService } from "./types";

interface DivisionServiceProps {
  divisionRepository: DivisionRepository;
}

const EMPTY_DIVISIONS: readonly Division[] = Object.freeze([]);

export const createDivisionService = ({ divisionRepository }: DivisionServiceProps): DivisionService => {
  // 조회 기능 (공용)
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
      const allDivisions = store.divisions;
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
      const store = useZustandDivisionStore.getState();
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

  // 관리 기능 (admin 전용, authFetcher에서 인증 확인됨)
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
      const existingDivision = store.divisions.find((d) => d.id === id);

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

  // Store 구독 메서드들 (공용)
  const useDivisions = (): Division[] => {
    return useZustandDivisionStore(useShallow((state) => state.divisions));
  };

  const useDivisionsByCompetition = (competitionId: string): Division[] => {
    const selector = useMemo(
      () => (s: { divisions: Division[] }) => {
        if (!competitionId) return EMPTY_DIVISIONS as Division[];
        // filter가 새 배열을 만들므로 원본은 불변. 그 배열에 한해서 sort mutate OK
        const list = s.divisions.filter((d) => d.competitionId === competitionId);
        list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
      },
      [competitionId]
    );

    // shallow 비교: 길이/순서/각 요소 참조가 같으면 리렌더 X
    return useZustandDivisionStore(useShallow(selector));
  };

  const useDivisionById = (id: string): Division | null => {
    const division = useZustandDivisionStore((state) => state.divisions.find((d) => d.id === id) ?? null);
    return division;
  };

  return {
    // Load functions (공용)
    load: {
      all: loadAllDivisions,
      byCompetition: loadDivisionsByCompetition,
      byId: loadDivisionById,
    },
    // Admin functions (관리자 전용)
    admin: {
      create: createDivision,
      update: updateDivision,
      delete: deleteDivision,
    },
    // Subscription hooks (구독)
    use: {
      divisions: useDivisions,
      divisionsByCompetition: useDivisionsByCompetition,
      divisionById: useDivisionById,
    },
  };
};
