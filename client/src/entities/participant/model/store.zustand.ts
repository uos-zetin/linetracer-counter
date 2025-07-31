import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Participant, ParticipantStore } from "./types";

export const useZustandParticipantStore = create<ParticipantStore>()(
  immer((set) => ({
    participants: [],

    // Actions - Division store와 동일한 패턴
    init: (participants: Participant[]) =>
      set((state) => {
        state.participants = participants;
      }),

    add: (participant: Participant) =>
      set((state) => {
        // 중복 제거 후 추가
        state.participants = state.participants.filter((p) => p.id !== participant.id);

        // 생성일시 순서에 맞게 삽입
        const insertIndex = state.participants.findIndex(
          (p) => new Date(participant.createdAt).getTime() > new Date(p.createdAt).getTime(),
        );

        if (insertIndex === -1) {
          state.participants.push(participant);
        } else {
          state.participants.splice(insertIndex, 0, participant);
        }
      }),

    addMany: (participants: Participant[]) =>
      set((state) => {
        // 새로운 participants들의 ID 목록
        const newParticipantIds = participants.map((p) => p.id);

        // 기존 participants에서 중복 제거
        state.participants = state.participants.filter((p) => !newParticipantIds.includes(p.id));

        // 새로운 participants들을 모두 추가
        state.participants.push(...participants);

        // 생성일시 순으로 정렬
        state.participants.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }),

    update: (participant: Participant) =>
      set((state) => {
        const index = state.participants.findIndex((p) => p.id === participant.id);
        if (index !== -1) {
          state.participants[index] = participant;
        }
      }),

    remove: (participantId: string) =>
      set((state) => {
        state.participants = state.participants.filter((p) => p.id !== participantId);
      }),
  })),
);
