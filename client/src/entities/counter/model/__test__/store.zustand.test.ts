import { beforeEach, describe, expect, it } from 'vitest';
import { useZustandCounterStore } from '../store.zustand';
import type { CounterState } from '../types';

describe('useZustandCounterStore', () => {
  beforeEach(() => {
    // Arrange: 각 테스트 전에 스토어 초기화
    useZustandCounterStore.getState().clearAll();
  });

  describe('init', () => {
    it('주어진 상태로 카운터를 초기화해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: null,
        stoppedAt: null,
        divisionId: 'div-1',
      };

      // Act
      useZustandCounterStore.getState().init(counterId, initialState);

      // Assert
      const counter = useZustandCounterStore.getState().counters.get(counterId);
      expect(counter).toEqual(initialState);
    });
  });

  describe('start', () => {
    it('주어진 타임스탬프로 카운터를 시작해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: null,
        stoppedAt: null,
        divisionId: 'div-1',
      };
      const startTime = Date.now();
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      useZustandCounterStore.getState().start(counterId, startTime);

      // Assert
      const counter = useZustandCounterStore.getState().counters.get(counterId);
      expect(counter?.startedAt).toBe(startTime);
      expect(counter?.stoppedAt).toBeNull();
    });

    it('존재하지 않는 카운터는 시작하지 않아야 한다', () => {
      // Arrange
      const counterId = 'non-existent';
      const startTime = Date.now();

      // Act
      useZustandCounterStore.getState().start(counterId, startTime);

      // Assert
      const counter = useZustandCounterStore.getState().counters.get(counterId);
      expect(counter).toBeUndefined();
    });
  });

  describe('stop', () => {
    it('실행 중인 카운터를 정지해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: Date.now() - 5000,
        stoppedAt: null,
        divisionId: 'div-1',
      };
      const stopTime = Date.now();
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      useZustandCounterStore.getState().stop(counterId, stopTime);

      // Assert
      const counter = useZustandCounterStore.getState().counters.get(counterId);
      expect(counter?.stoppedAt).toBe(stopTime);
      expect(counter?.startedAt).toBe(initialState.startedAt);
    });
  });

  describe('reset', () => {
    it('카운터 타임스탬프를 리셋해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: Date.now() - 5000,
        stoppedAt: Date.now(),
        divisionId: 'div-1',
      };
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      useZustandCounterStore.getState().reset(counterId);

      // Assert
      const counter = useZustandCounterStore.getState().counters.get(counterId);
      expect(counter?.startedAt).toBeNull();
      expect(counter?.stoppedAt).toBeNull();
      expect(counter?.name).toBe('Test Counter'); // 다른 속성은 유지
    });
  });

  describe('getIsRunning', () => {
    it('실행 중인 카운터에 대해 true를 반환해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: Date.now() - 5000,
        stoppedAt: null,
        divisionId: 'div-1',
      };
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      const isRunning = useZustandCounterStore.getState().getIsRunning(counterId);

      // Assert
      expect(isRunning).toBe(true);
    });

    it('정지된 카운터에 대해 false를 반환해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: Date.now() - 5000,
        stoppedAt: Date.now(),
        divisionId: 'div-1',
      };
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      const isRunning = useZustandCounterStore.getState().getIsRunning(counterId);

      // Assert
      expect(isRunning).toBe(false);
    });

    it('존재하지 않는 카운터에 대해 false를 반환해야 한다', () => {
      // Arrange
      const counterId = 'non-existent';

      // Act
      const isRunning = useZustandCounterStore.getState().getIsRunning(counterId);

      // Assert
      expect(isRunning).toBe(false);
    });
  });

  describe('getElapsedMs', () => {
    it('실행 중인 카운터의 경과 시간을 계산해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const startTime = Date.now() - 5000;
      const currentTime = Date.now();
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: startTime,
        stoppedAt: null,
        divisionId: 'div-1',
      };
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      const elapsed = useZustandCounterStore.getState().getElapsedMs(counterId, currentTime);

      // Assert
      expect(elapsed).toBe(currentTime - startTime);
    });

    it('존재하지 않는 카운터에 대해 0을 반환해야 한다', () => {
      // Arrange
      const counterId = 'non-existent';

      // Act
      const elapsed = useZustandCounterStore.getState().getElapsedMs(counterId);

      // Assert
      expect(elapsed).toBe(0);
    });
  });

  describe('getDivisionId', () => {
    it('존재하는 카운터의 구역 ID를 반환해야 한다', () => {
      // Arrange
      const counterId = 'test-counter';
      const divisionId = 'div-123';
      const initialState: CounterState = {
        id: counterId,
        name: 'Test Counter',
        startedAt: null,
        stoppedAt: null,
        divisionId,
      };
      
      useZustandCounterStore.getState().init(counterId, initialState);

      // Act
      const result = useZustandCounterStore.getState().getDivisionId(counterId);

      // Assert
      expect(result).toBe(divisionId);
    });

    it('존재하지 않는 카운터에 대해 null을 반환해야 한다', () => {
      // Arrange
      const counterId = 'non-existent';

      // Act
      const result = useZustandCounterStore.getState().getDivisionId(counterId);

      // Assert
      expect(result).toBeNull();
    });
  });
});