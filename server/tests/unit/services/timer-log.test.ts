import { AuthorizationError, TimerLogConsecutiveError } from "@/core/errors";
import { Actor, TimerLog } from "@/core/models";
import { TimerLogRepository } from "@/core/repositories";

import { TimerLogServiceImpl } from "@/services/timer-log";

import { v4 as uuidv4 } from "uuid";

const mockTimerLogRepo: jest.Mocked<TimerLogRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const generateDummyTimerLog = (
  participantId: string,
  type: TimerLog["type"],
  value: number
): TimerLog => ({
  id: uuidv4(),
  participantId,
  value,
  type,
  createdAt: new Date(),
});

describe("TimerLogService 구현체 단위 테스트", () => {
  let service: TimerLogServiceImpl;
  let adminActor: Actor;
  let anonymousActor: Actor;

  beforeAll(() => {
    // Arrange: 테스트에 필요한 액터들을 준비
    adminActor = {
      id: uuidv4(),
      name: "관리자",
      roles: ["administrator"],
      createdAt: new Date(),
    };
    anonymousActor = {
      id: uuidv4(),
      name: "익명 사용자",
      roles: [],
      createdAt: new Date(),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TimerLogServiceImpl({
      timerLogRepository: mockTimerLogRepo,
    });
  });

  it("아무나 특정 참가자의 타이머 기록을 조회할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const timerLogs: TimerLog[] = [
      generateDummyTimerLog(participantId, "start", Date.now()),
      generateDummyTimerLog(participantId, "stop", Date.now()),
    ];
    mockTimerLogRepo.getByParticipantId.mockResolvedValue(timerLogs);

    // Act
    const result = await service.getTimerLogs(anonymousActor, participantId);

    // Assert
    expect(result).toEqual(timerLogs);
    expect(mockTimerLogRepo.getByParticipantId).toHaveBeenCalledWith(
      participantId
    );
  });

  it("관리자만 타이머를 시작할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const timerLog = generateDummyTimerLog(participantId, "start", Date.now());
    mockTimerLogRepo.create.mockResolvedValue(timerLog);
    jest.spyOn(service, "checkTimerIsRunning").mockResolvedValue(false);

    // Act & Assert: 권한이 없는 사용자는 타이머 시작 불가
    await expect(
      service.startTimer(anonymousActor, participantId)
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert: 관리자는 타이머 시작 가능
    const adminResult = await service.startTimer(adminActor, participantId);
    expect(adminResult).toEqual(timerLog);
    expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        participantId,
        type: "start",
      })
    );
  });

  it("관리자만 타이머를 중지할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const timerLog = generateDummyTimerLog(participantId, "stop", Date.now());
    mockTimerLogRepo.create.mockResolvedValue(timerLog);
    jest.spyOn(service, "checkTimerIsRunning").mockResolvedValue(true);

    // Act & Assert: 권한이 없는 사용자는 타이머 중지 불가
    await expect(
      service.stopTimer(anonymousActor, participantId)
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert: 관리자는 타이머 중지 가능
    const adminResult = await service.stopTimer(adminActor, participantId);
    expect(adminResult).toEqual(timerLog);
    expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        participantId,
        type: "stop",
      })
    );
  });

  it("관리자만 타이머를 조정할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const adjustmentMs = 5000;
    const timerLog = generateDummyTimerLog(
      participantId,
      "adjust",
      adjustmentMs
    );
    mockTimerLogRepo.create.mockResolvedValue(timerLog);

    // Act & Assert: 권한이 없는 사용자는 타이머 조정 불가
    await expect(
      service.adjustTimer(anonymousActor, participantId, adjustmentMs)
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert: 관리자는 타이머 조정 가능
    const adminResult = await service.adjustTimer(
      adminActor,
      participantId,
      adjustmentMs
    );
    expect(adminResult).toEqual(timerLog);
    expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        participantId,
        type: "adjust",
        value: adjustmentMs,
      })
    );
  });

  it("타이머가 시작된 상태에서는 타이머를 시작할 수 없다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const timerLogs: TimerLog[] = [
      generateDummyTimerLog(participantId, "adjust", 1000),
      generateDummyTimerLog(participantId, "start", Date.now()),
    ];
    mockTimerLogRepo.getByParticipantId.mockResolvedValue(timerLogs);

    // Act
    const asyncTask = service.startTimer(adminActor, participantId);

    // Assert
    await expect(asyncTask).rejects.toThrow(TimerLogConsecutiveError);
  });

  it("타이머가 중지된 상태에서는 타이머를 중지할 수 없다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const timerLogs: TimerLog[] = [
      generateDummyTimerLog(participantId, "adjust", 1000),
      generateDummyTimerLog(participantId, "start", Date.now()),
      generateDummyTimerLog(participantId, "stop", Date.now()),
    ];
    mockTimerLogRepo.getByParticipantId.mockResolvedValue(timerLogs);

    // Act
    const asyncTask = service.stopTimer(adminActor, participantId);

    // Assert
    await expect(asyncTask).rejects.toThrow(TimerLogConsecutiveError);
  });

  describe("타이머 로그 이벤트 구독 테스트", () => {
    let participantId: string;
    let callback1: jest.Mock;
    let callback2: jest.Mock;
    let callback1Unsubscriber: () => void;
    let callback2Unsubscriber: () => void;

    beforeEach(() => {
      // Arrange
      participantId = uuidv4();
      callback1 = jest.fn();
      callback2 = jest.fn();
      callback1Unsubscriber = service.subscribeTimerLogsChanged(
        participantId,
        callback1
      );
      callback2Unsubscriber = service.subscribeTimerLogsChanged(
        participantId,
        callback2
      );
    });

    afterEach(() => {
      callback1Unsubscriber();
      callback2Unsubscriber();
      jest.clearAllMocks();
    });

    it("타이머가 시작되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const timerLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now()
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      jest.spyOn(service, "checkTimerIsRunning").mockResolvedValue(false);

      // Act
      await service.startTimer(adminActor, participantId);

      // Assert
      expect(callback1).toHaveBeenCalledWith(timerLog);
      expect(callback2).toHaveBeenCalledWith(timerLog);
    });

    it("타이머가 중지되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const timerLog = generateDummyTimerLog(participantId, "stop", Date.now());
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      jest.spyOn(service, "checkTimerIsRunning").mockResolvedValue(true);

      // Act
      await service.stopTimer(adminActor, participantId);

      // Assert
      expect(callback1).toHaveBeenCalledWith(timerLog);
      expect(callback2).toHaveBeenCalledWith(timerLog);
    });

    it("타이머가 조정되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const adjustmentMs = -3000;
      const timerLog = generateDummyTimerLog(
        participantId,
        "adjust",
        adjustmentMs
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);

      // Act
      await service.adjustTimer(adminActor, participantId, adjustmentMs);

      // Assert
      expect(callback1).toHaveBeenCalledWith(timerLog);
      expect(callback2).toHaveBeenCalledWith(timerLog);
    });

    it("구독 함수에서 오류가 발생해도 서비스 로직은 정상적으로 동작한다.", async () => {
      // Arrange
      const timerLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now()
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      callback1.mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
      const errorSpy = jest // 오류 메시지 출력 방지
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const asyncTask = service.startTimer(adminActor, participantId);

      // Assert
      await expect(asyncTask).resolves.toBe(timerLog);
      expect(callback1).toHaveBeenCalledWith(timerLog);
      expect(callback2).toHaveBeenCalledWith(timerLog);

      // Cleanup
      errorSpy.mockRestore();
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const timerLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now()
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      callback1Unsubscriber();

      // Act
      await service.startTimer(adminActor, participantId);

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(timerLog);
    });
  });
});
