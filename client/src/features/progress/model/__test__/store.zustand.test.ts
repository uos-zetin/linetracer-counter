import { beforeEach, describe, expect, it } from 'vitest';
import { useZustandProgressStore } from '../store.zustand';
import type { ProgressState } from '../types';

describe('useZustandProgressStore', () => {
  beforeEach(() => {
    // Arrange: 각 테스트 전에 스토어 초기화
    useZustandProgressStore.getState().reset();
  });

  describe('setProgress', () => {
    it('주어진 상태로 진행 상황을 설정해야 한다', () => {
      // Arrange
      const progressState: ProgressState = {
        id: 'progress-1',
        competition: {
          id: 'comp-1',
          name: 'Test Competition',
          startedAt: new Date().toISOString(),
          endedAt: null,
        },
        division: {
          id: 'div-1',
          name: 'Test Division',
          competitionId: 'comp-1',
        },
        runner: null,
        nextRunners: [],
        topRecords: [],
      };

      // Act
      useZustandProgressStore.getState().setProgress(progressState);

      // Assert
      const state = useZustandProgressStore.getState();
      expect(state.id).toBe('progress-1');
      expect(state.competition?.name).toBe('Test Competition');
      expect(state.division?.name).toBe('Test Division');
    });
  });

  describe('patchProgress', () => {
    it('부분적인 상태 업데이트를 수행해야 한다', () => {
      // Arrange
      const initialState: ProgressState = {
        id: 'progress-1',
        competition: null,
        division: null,
        runner: null,
        nextRunners: [],
        topRecords: [],
      };
      
      useZustandProgressStore.getState().setProgress(initialState);

      const partialUpdate = {
        id: 'progress-updated',
        competition: {
          id: 'comp-1',
          name: 'Updated Competition',
          startedAt: new Date().toISOString(),
          endedAt: null,
        },
      };

      // Act
      useZustandProgressStore.getState().patchProgress(partialUpdate);

      // Assert
      const state = useZustandProgressStore.getState();
      expect(state.id).toBe('progress-updated');
      expect(state.competition?.name).toBe('Updated Competition');
      expect(state.division).toBeNull(); // 다른 속성은 유지
    });
  });

  describe('reset', () => {
    it('상태를 초기값으로 리셋해야 한다', () => {
      // Arrange
      const progressState: ProgressState = {
        id: 'progress-1',
        competition: {
          id: 'comp-1',
          name: 'Test Competition',
          startedAt: new Date().toISOString(),
          endedAt: null,
        },
        division: {
          id: 'div-1',
          name: 'Test Division',
          competitionId: 'comp-1',
        },
        runner: null,
        nextRunners: [],
        topRecords: [],
      };
      
      useZustandProgressStore.getState().setProgress(progressState);

      // Act
      useZustandProgressStore.getState().reset();

      // Assert
      const state = useZustandProgressStore.getState();
      expect(state.id).toBe('');
      expect(state.competition).toBeNull();
      expect(state.division).toBeNull();
      expect(state.runner).toBeNull();
      expect(state.nextRunners).toEqual([]);
      expect(state.topRecords).toEqual([]);
    });
  });

  describe('getProgress', () => {
    it('현재 진행 상태를 반환해야 한다', () => {
      // Arrange
      const progressState: ProgressState = {
        id: 'progress-1',
        competition: {
          id: 'comp-1',
          name: 'Test Competition',
          startedAt: new Date().toISOString(),
          endedAt: null,
        },
        division: null,
        runner: null,
        nextRunners: [],
        topRecords: [],
      };
      
      useZustandProgressStore.getState().setProgress(progressState);

      // Act
      const progress = useZustandProgressStore.getState().getProgress();

      // Assert
      expect(progress.id).toBe('progress-1');
      expect(progress.competition?.name).toBe('Test Competition');
    });
  });

  describe('getCompetition', () => {
    it('현재 대회 정보를 반환해야 한다', () => {
      // Arrange
      const competition = {
        id: 'comp-1',
        name: 'Test Competition',
        startedAt: new Date().toISOString(),
        endedAt: null,
      };
      
      useZustandProgressStore.getState().patchProgress({ competition });

      // Act
      const result = useZustandProgressStore.getState().getCompetition();

      // Assert
      expect(result?.name).toBe('Test Competition');
    });

    it('대회가 없을 때 null을 반환해야 한다', () => {
      // Arrange
      useZustandProgressStore.getState().reset();

      // Act
      const result = useZustandProgressStore.getState().getCompetition();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getDivision', () => {
    it('현재 구역 정보를 반환해야 한다', () => {
      // Arrange
      const division = {
        id: 'div-1',
        name: 'Test Division',
        competitionId: 'comp-1',
      };
      
      useZustandProgressStore.getState().patchProgress({ division });

      // Act
      const result = useZustandProgressStore.getState().getDivision();

      // Assert
      expect(result?.name).toBe('Test Division');
    });

    it('구역이 없을 때 null을 반환해야 한다', () => {
      // Arrange
      useZustandProgressStore.getState().reset();

      // Act
      const result = useZustandProgressStore.getState().getDivision();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getRunner', () => {
    it('현재 주자 정보를 반환해야 한다', () => {
      // Arrange
      const runner = {
        participant: {
          id: 'part-1',
          name: 'Test Runner',
          divisionId: 'div-1',
        },
        timerLogs: [],
        records: [],
        manualRecords: [],
      };
      
      useZustandProgressStore.getState().patchProgress({ runner });

      // Act
      const result = useZustandProgressStore.getState().getRunner();

      // Assert
      expect(result?.participant.name).toBe('Test Runner');
    });

    it('주자가 없을 때 null을 반환해야 한다', () => {
      // Arrange
      useZustandProgressStore.getState().reset();

      // Act
      const result = useZustandProgressStore.getState().getRunner();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getNextRunners', () => {
    it('다음 주자 목록을 반환해야 한다', () => {
      // Arrange
      const nextRunners = [
        {
          id: 'part-1',
          name: 'Runner 1',
          divisionId: 'div-1',
        },
        {
          id: 'part-2',
          name: 'Runner 2',
          divisionId: 'div-1',
        },
      ];
      
      useZustandProgressStore.getState().patchProgress({ nextRunners });

      // Act
      const result = useZustandProgressStore.getState().getNextRunners();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Runner 1');
      expect(result[1].name).toBe('Runner 2');
    });

    it('다음 주자가 없을 때 빈 배열을 반환해야 한다', () => {
      // Arrange
      useZustandProgressStore.getState().reset();

      // Act
      const result = useZustandProgressStore.getState().getNextRunners();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getTopRecords', () => {
    it('상위 기록 목록을 반환해야 한다', () => {
      // Arrange
      const topRecords = [
        {
          id: 'record-1',
          participantId: 'part-1',
          divisionId: 'div-1',
          time: 1000,
          rank: 1,
        },
        {
          id: 'record-2',
          participantId: 'part-2',
          divisionId: 'div-1',
          time: 1100,
          rank: 2,
        },
      ];
      
      useZustandProgressStore.getState().patchProgress({ topRecords });

      // Act
      const result = useZustandProgressStore.getState().getTopRecords();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(2);
    });

    it('상위 기록이 없을 때 빈 배열을 반환해야 한다', () => {
      // Arrange
      useZustandProgressStore.getState().reset();

      // Act
      const result = useZustandProgressStore.getState().getTopRecords();

      // Assert
      expect(result).toEqual([]);
    });
  });
});