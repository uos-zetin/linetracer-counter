import type { Participant, ParticipantRepository, ParticipantForm } from "@/entities/participant";
import { useZustandParticipantStore } from "@/entities/participant";
import type { AdminParticipantService } from "./types";

interface AdminParticipantServiceProps {
  participantRepository: ParticipantRepository;
}

export const createAdminParticipantService = ({
  participantRepository,
}: AdminParticipantServiceProps): AdminParticipantService => {
  const loadParticipantsByDivisions = async (divisionIds: string[]): Promise<void> => {
    try {
      // 모든 division의 participants를 동시에 로드
      const allParticipantsPromises = divisionIds.map((divisionId) =>
        participantRepository.getAllParticipants(divisionId)
      );

      const allParticipantsArrays = await Promise.all(allParticipantsPromises);
      const allParticipants = allParticipantsArrays.flat();

      // 한 번에 모든 participants 설정
      const store = useZustandParticipantStore.getState();
      store.init(allParticipants);
    } catch (error) {
      console.error("Failed to load participants for divisions:", error);
      throw error;
    }
  };

  const loadAllParticipants = async (): Promise<void> => {
    try {
      // 빈 배열로 초기화
      const store = useZustandParticipantStore.getState();
      store.init([]);
    } catch (error) {
      console.error("Failed to load all participants:", error);
      throw error;
    }
  };

  const loadParticipantsByDivision = async (divisionId: string): Promise<void> => {
    try {
      const participants = await participantRepository.getAllParticipants(divisionId);

      // 한 번에 여러 participants 추가
      const store = useZustandParticipantStore.getState();
      store.addMany(participants);
    } catch (error) {
      console.error(`Failed to load participants for division ${divisionId}:`, error);
      throw error;
    }
  };

  const createParticipant = async (data: ParticipantForm): Promise<void> => {
    try {
      const newParticipant = await participantRepository.createParticipant(data.divisionId, data);

      // Store 업데이트
      const store = useZustandParticipantStore.getState();
      store.add(newParticipant);
    } catch (error) {
      console.error("Failed to create participant:", error);
      throw error;
    }
  };

  const updateParticipant = async (id: string, data: ParticipantForm): Promise<void> => {
    try {
      // 기존 participant 정보를 가져와서 업데이트
      const store = useZustandParticipantStore.getState();
      const existingParticipant = store.participants.find((p) => p.id === id);

      const participantToUpdate: Participant = {
        id,
        ...data,
        createdAt: existingParticipant?.createdAt || new Date(),
      };

      const updatedParticipant = await participantRepository.updateParticipant(id, participantToUpdate);

      // Store 업데이트
      if (updatedParticipant) {
        store.update(updatedParticipant);
      }
    } catch (error) {
      console.error(`Failed to update participant ${id}:`, error);
      throw error;
    }
  };

  const deleteParticipant = async (id: string): Promise<void> => {
    try {
      await participantRepository.deleteParticipant(id);

      // Store 업데이트
      const store = useZustandParticipantStore.getState();
      store.remove(id);
    } catch (error) {
      console.error(`Failed to delete participant ${id}:`, error);
      throw error;
    }
  };

  // Store 구독 메서드들
  const useParticipants = (): Participant[] => {
    return useZustandParticipantStore((state) => state.participants);
  };

  const useParticipantsByDivision = (divisionId: string): Participant[] => {
    const allParticipants = useZustandParticipantStore((state) => state.participants);

    // 빈 divisionId면 빈 배열 반환
    if (!divisionId) {
      return [];
    }

    // Service에서 필터링 및 정렬
    return allParticipants.filter((p) => p.divisionId === divisionId).sort((a, b) => a.orderRaw - b.orderRaw);
  };

  const useParticipantById = (id: string): Participant | null => {
    return useZustandParticipantStore((state) => state.participants.find((p) => p.id === id) ?? null);
  };

  return {
    // Store state updates
    loadAllParticipants,
    loadParticipantsByDivisions,
    loadParticipantsByDivision,
    createParticipant,
    updateParticipant,
    deleteParticipant,

    // Store 구독 메서드들
    useParticipants,
    useParticipantsByDivision,
    useParticipantById,
  };
};
