import { FrontBackIrCounterDevice } from "@/infrastructure/counters/front-back-ir-counter-device";

describe("FrontBackIrCounterDevice 단위 테스트", () => {
  const convertToTransitionData = (data: [number, number][]) => {
    return data.map((d, i) => ({
      timestamp: i,
      startSensor: d[0],
      endSensor: d[1],
    }));
  };

  const startThreshold = 100;
  const endThreshold = 100;
  const endDebouncingTime = 3;

  const endToRunningTransitionData = convertToTransitionData([
    [255, 255],
    [70, 255],
    [255, 255],
  ]);
  const runningToEndBeginTransitionData = convertToTransitionData([
    [70, 255],
    [255, 255],
    [255, 80],
    [255, 70],
    [255, 90],
  ]);
  const endBeginToEndDebouncingTransitionData = convertToTransitionData([
    [80, 255],
    [255, 80],
    [255, 200],
    [255, 255],
  ]);
  const endDebouncingToEndBeginTransitionData = convertToTransitionData([
    [80, 255],
    [255, 80],
    [255, 200],
    [255, 255],
    [255, 90],
  ]);
  const endDebouncingToEndTransitionData = convertToTransitionData([
    [80, 255],
    [255, 80],
    [255, 200],
    [255, 200],
    [255, 200],
    [255, 255],
  ]);
  const debouncingTestData = convertToTransitionData([
    [255, 255],
    [70, 255], // start
    [255, 255],
    [255, 255],
    [255, 70], // end trigger
    [255, 80],
    [255, 255], // debouncing
    [255, 255], // debouncing
    [255, 90], // end trigger
    [255, 80],
    [255, 70],
    [255, 60],
    [255, 50],
    [255, 60],
    [255, 70],
    [255, 80], // final end trigger
    [255, 255], // debouncing
    [255, 255], // debouncing
    [255, 255], // debouncing
  ]);

  let device: FrontBackIrCounterDevice;

  beforeEach(() => {
    // Arrange
    device = new FrontBackIrCounterDevice(
      "test-device-id",
      "test-counter",
      startThreshold,
      endThreshold,
      endDebouncingTime
    );
  });

  describe("상태 전이 테스트", () => {
    it("초기 상태는 end 상태이다.", () => {
      // Assert
      expect(device.state).toBe("end");
    });

    it("end 상태에서 running 상태로 전이할 수 있다.", () => {
      // Act
      for (const data of endToRunningTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("running");
    });

    it("running 상태에서 end-begin 상태로 전이할 수 있다.", () => {
      // Act
      for (const data of runningToEndBeginTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("end-begin");
    });

    it("end-begin 상태에서 end-debouncing 상태로 전이할 수 있다.", () => {
      // Act
      for (const data of endBeginToEndDebouncingTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("end-debouncing");
    });

    it("end-debouncing 상태에서 end-begin 상태로 전이할 수 있다.", () => {
      // Act
      for (const data of endDebouncingToEndBeginTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("end-begin");
    });

    it("end-debouncing 상태에서 end 상태로 전이할 수 있다.", () => {
      // Act
      for (const data of endDebouncingToEndTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("end");
    });

    it("debouncing 테스트", async () => {
      // Act
      for (const data of debouncingTestData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(device.state).toBe("end");
      expect((await device.getStatus()).stoppedAt).toBe(15);
    });
  });

  describe("이벤트 구독 테스트", () => {
    it("출발 이벤트를 받을 수 있다.", () => {
      // Arrange
      const startEventData = convertToTransitionData([
        [255, 255],
        [70, 255],
        [60, 255],
        [255, 255],
      ]);
      const callback = jest.fn();
      device.subscribe(callback);

      // Act
      for (const data of startEventData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "start",
        startedAt: 1,
      });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("도착 이벤트를 받을 수 있다.", () => {
      // Arrange
      const endEventData = convertToTransitionData([
        [255, 255],
        [70, 255],
        [240, 255],
        [255, 200],
        [255, 210],
        [255, 220],
        [255, 80],
        [255, 210],
        [255, 240],
        [255, 250],
        [255, 255],
      ]);
      const callback = jest.fn();
      device.subscribe(callback);

      // Act
      for (const data of endEventData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "stop",
        startedAt: 1,
        stoppedAt: 6,
      });
      expect(callback).toHaveBeenCalledTimes(2); // 시작 이벤트도 발생했을 것이므로 2번 호출된다.
    });

    it("구독 해지 테스트", () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = device.subscribe(callback);

      // Act
      unsubscribe();
      for (const data of convertToTransitionData([
        [0, 0],
        [110, 0],
      ])) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("초기화 테스트", () => {
    it("running 상태에서 초기화를 할 수 있다.", async () => {
      // Arrange
      for (const data of endToRunningTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Act
      await device.reset();

      // Assert
      expect(device.state).toBe("end");
    });

    it("end-begin 상태에서 초기화를 할 수 있다.", async () => {
      // Arrange
      for (const data of runningToEndBeginTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Act
      await device.reset();

      // Assert
      expect(device.state).toBe("end");
    });

    it("end-debouncing 상태에서 초기화를 할 수 있다.", async () => {
      // Arrange
      for (const data of endBeginToEndDebouncingTransitionData) {
        device.transitState(data.timestamp, data.startSensor, data.endSensor);
      }

      // Act
      await device.reset();

      // Assert
      expect(device.state).toBe("end");
    });
  });
});
