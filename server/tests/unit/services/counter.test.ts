import { CounterDeviceEvent, CounterDeviceRegistry } from "@/core/interfaces";
import { CounterService } from "@/core/services/counter";
import { DivisionProgressService } from "@/core/services/division-progress";

const createMockCounterDevice = (deviceId: string, name: string) => {
  return {
    deviceId,
    name,
    subscribe: jest.fn(),
    getStatus: jest.fn(),
    reset: jest.fn(),
  };
};

const mockCounterRegistry: jest.Mocked<CounterDeviceRegistry> = {
  getCounterDevices: jest.fn(),
  getCounterDevice: jest.fn(),
  unregisterCounterDevice: jest.fn(),
  subscribeCounterDeviceEvent: jest.fn(),
};

const mockDivisionProgressService: jest.Mocked<DivisionProgressService> = {
  addRecordToRunner: jest.fn(),
} as any;

describe("CounterService 단위 테스트", () => {
  let counterService: CounterService;

  beforeEach(() => {
    jest.clearAllMocks();

    counterService = new CounterService({
      counterRegistry: mockCounterRegistry,
      divisionProgressService: mockDivisionProgressService,
    });
  });

  describe("getCounters", () => {
    it("모든 계수기 목록을 반환할 수 있다.", async () => {
      // Arrange
      const device1 = createMockCounterDevice("counter-001", "Test Counter");
      const device2 = createMockCounterDevice("counter-002", "Test Counter 2");
      device1.getStatus.mockResolvedValue({
        startedAt: null,
        stoppedAt: null,
      });
      device2.getStatus.mockResolvedValue({
        startedAt: 1000,
        stoppedAt: 2000,
      });
      mockCounterRegistry.getCounterDevices.mockResolvedValue([
        device1,
        device2,
      ]);

      // Act
      const result = await counterService.getCounters();

      // Assert
      expect(result).toEqual([
        {
          deviceId: "counter-001",
          name: "Test Counter",
          startedAt: null,
          stoppedAt: null,
          divisionId: null,
        },
        {
          deviceId: "counter-002",
          name: "Test Counter 2",
          startedAt: 1000,
          stoppedAt: 2000,
          divisionId: null,
        },
      ]);
    });
  });

  describe("getCounter", () => {
    it("특정 계수기 정보를 반환할 수 있다.", async () => {
      // Arrange
      const device = createMockCounterDevice("counter-001", "Test Counter");
      device.getStatus.mockResolvedValue({
        startedAt: 1000,
        stoppedAt: 2000,
      });
      mockCounterRegistry.getCounterDevice.mockResolvedValue(device);

      // Act
      const result = await counterService.getCounter("counter-001");

      // Assert
      expect(result).toEqual({
        deviceId: "counter-001",
        name: "Test Counter",
        startedAt: 1000,
        stoppedAt: 2000,
        divisionId: null,
      });
    });
  });

  describe("resetCounter", () => {
    it("계수기를 초기화할 수 있다.", async () => {
      // Arrange
      const device = createMockCounterDevice("counter-001", "Test Counter");
      mockCounterRegistry.getCounterDevice.mockResolvedValue(device);

      // Act
      await counterService.resetCounter("counter-001");

      // Assert
      expect(device.reset).toHaveBeenCalled();
    });
  });

  describe("unregisterCounter", () => {
    it("계수기를 등록 해제할 수 있다.", async () => {
      // Arrange
      const deviceId = "counter-001";
      mockCounterRegistry.unregisterCounterDevice.mockResolvedValue();

      // Act
      await counterService.unregisterCounter(deviceId);

      // Assert
      expect(mockCounterRegistry.unregisterCounterDevice).toHaveBeenCalledWith(
        deviceId
      );
    });
  });

  describe("linkCounterToDivision", () => {
    it("계수기를 대회 부문에 연결하고 stop 이벤트 시 기록이 자동으로 추가된다.", async () => {
      // Arrange
      const deviceId = "counter-001";
      const divisionId = "division-001";
      let eventCallback: (event: CounterDeviceEvent) => void = () => {};
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(
        (_, callback) => {
          eventCallback = callback;
          return () => {};
        }
      );

      // Act
      await counterService.linkCounterToDivision(deviceId, divisionId);
      eventCallback({
        // stop 이벤트 시뮬레이션
        type: "stop",
        startedAt: 1000,
        stoppedAt: 2500,
      });

      // Assert
      expect(
        mockCounterRegistry.subscribeCounterDeviceEvent
      ).toHaveBeenCalledWith(deviceId, expect.any(Function));
      expect(
        mockDivisionProgressService.addRecordToRunner
      ).toHaveBeenCalledWith(
        divisionId,
        1500, // stoppedAt - startedAt
        "stopwatch",
        ""
      );
    });

    it("계수기에 대회 부문이 연결되어 있는 경우 기존 구독을 해제하고 새롭게 구독한다.", async () => {
      // Arrange
      const deviceId = "counter-001";
      const oldDivisionId = "division-001";
      const newDivisionId = "division-002";
      const firstUnsubscribe = jest.fn();
      const secondUnsubscribe = jest.fn();
      mockCounterRegistry.subscribeCounterDeviceEvent
        .mockReturnValueOnce(firstUnsubscribe)
        .mockReturnValueOnce(secondUnsubscribe);
      await counterService.linkCounterToDivision(deviceId, oldDivisionId); // 첫 번째 연결

      // Act
      await counterService.linkCounterToDivision(deviceId, newDivisionId); // 두 번째 연결 (기존 연결 해제 후 새 연결)

      // Assert
      expect(firstUnsubscribe).toHaveBeenCalled();
      expect(
        mockCounterRegistry.subscribeCounterDeviceEvent
      ).toHaveBeenCalledTimes(2);
    });
  });

  describe("subscribeCounterEvent", () => {
    it("계수기의 start 이벤트 발생 시 counter:updated 이벤트가 발생한다.", () => {
      // Arrange
      const deviceId = "counter-001";
      const events: any[] = [];
      let deviceEventCallback: (event: CounterDeviceEvent) => void = () => {};
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(
        (_, callback) => {
          deviceEventCallback = callback;
          return () => {};
        }
      );

      // Act
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        async (event) => {
          events.push(event);
        }
      );
      deviceEventCallback({
        type: "start",
        startedAt: 1000,
      });

      // Assert
      expect(events).toEqual([
        {
          type: "counter:updated",
          startedAt: 1000,
          stoppedAt: null,
        },
      ]);

      // Cleanup
      unsubscribe();
    });

    it("계수기의 stop 이벤트 발생 시 counter:updated 이벤트가 발생한다.", () => {
      // Arrange
      const deviceId = "counter-001";
      const events: any[] = [];
      let deviceEventCallback: (event: CounterDeviceEvent) => void = () => {};
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(
        (_, callback) => {
          deviceEventCallback = callback;
          return () => {};
        }
      );

      // Act
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        async (event) => {
          events.push(event);
        }
      );
      deviceEventCallback({
        type: "stop",
        startedAt: 1000,
        stoppedAt: 2000,
      });

      // Assert
      expect(events).toEqual([
        {
          type: "counter:updated",
          startedAt: 1000,
          stoppedAt: 2000,
        },
      ]);

      // Cleanup
      unsubscribe();
    });

    it("계수기의 reset 이벤트 발생 시 counter:updated 이벤트가 발생한다.", () => {
      // Arrange
      const deviceId = "counter-001";
      const events: any[] = [];
      let deviceEventCallback: (event: CounterDeviceEvent) => void = () => {};
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(
        (_, callback) => {
          deviceEventCallback = callback;
          return () => {};
        }
      );

      // Act
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        async (event) => {
          events.push(event);
        }
      );
      deviceEventCallback({
        type: "reset",
      });

      // Assert
      expect(events).toEqual([
        {
          type: "counter:updated",
          startedAt: null,
          stoppedAt: null,
        },
      ]);

      // Cleanup
      unsubscribe();
    });

    it("계수기에 대회 부문을 연결하면 division:bound 이벤트가 발생한다.", async () => {
      // Arrange
      const deviceId = "counter-001";
      const divisionId = "division-001";
      const events: any[] = [];

      // Act
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        async (event) => {
          events.push(event);
        }
      );
      await counterService.linkCounterToDivision(deviceId, divisionId);

      // Assert
      expect(events).toEqual([
        {
          type: "division:bound",
          divisionId,
        },
      ]);

      // Cleanup
      unsubscribe();
    });

    it("계수기에 대회 부문을 연결 해제하면 division:unbound 이벤트가 발생한다.", async () => {
      // Arrange
      const deviceId = "counter-001";
      const divisionId = "division-001";
      await counterService.linkCounterToDivision(deviceId, divisionId); // 연결된 상태
      const events: any[] = [];

      // Act
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        async (event) => {
          events.push(event);
        }
      );
      await counterService.linkCounterToDivision(deviceId, null);

      // Assert
      expect(events).toEqual([
        {
          type: "division:unbound",
        },
      ]);

      // Cleanup
      unsubscribe();
    });

    it("구독 해제 시 계수기 장비 이벤트 구독을 정리한다.", () => {
      // Arrange
      const deviceId = "counter-001";
      const mockUnsubscribe = jest.fn();
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(() => {
        return mockUnsubscribe;
      });
      const callback = jest.fn();
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        callback
      );

      // Act
      unsubscribe();
      counterService.linkCounterToDivision(deviceId, null);

      // Assert
      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it("리스너에서 예외가 발생해도 서비스 로직은 계속 진행되어야 한다.", async () => {
      // Arrange
      const spyOnError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const deviceId = "counter-001";
      const callback = jest
        .fn()
        .mockRejectedValue(
          new Error("에러가 발생해도 서비스 로직은 계속 진행되어야 해요.")
        );
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        callback
      );

      // Act
      const asyncTask = counterService.linkCounterToDivision(deviceId, null);

      // Assert
      await expect(asyncTask).resolves.not.toThrow();

      // Cleanup
      unsubscribe();
      spyOnError.mockRestore();
    });

    it("리스너에서 예외가 발생해도 계수기 장비 이벤트 구독은 정상적으로 처리되어야 한다.", async () => {
      // Arrange
      const spyOnError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const deviceId = "counter-001";
      let deviceEventCallback: (event: CounterDeviceEvent) => void = () => {};
      mockCounterRegistry.subscribeCounterDeviceEvent.mockImplementation(
        (_, callback) => {
          deviceEventCallback = callback;
          return () => {};
        }
      );
      const callback = jest
        .fn()
        .mockRejectedValue(
          new Error(
            "에러가 발생해도 계수기 장비 이벤트 구독은 정상적으로 처리되어야 해요."
          )
        );
      const unsubscribe = counterService.subscribeCounterEvent(
        deviceId,
        callback
      );

      // Act
      const asyncTask = deviceEventCallback({
        type: "start",
        startedAt: 1000,
      });

      // Assert
      await expect(asyncTask).resolves.not.toThrow();

      // Cleanup
      unsubscribe();
      spyOnError.mockRestore();
    });
  });
});
