import { AuthorizationError } from "@/core/errors";
import { Actor, ManualRecord } from "@/core/models";
import { ManualRecordRepository } from "@/core/repositories";
import { Unsubscriber } from "@/core/services";

import { ManualRecordServiceImpl } from "@/core/services/manual-record";

import { v4 as uuidv4 } from "uuid";

const mockManualRecordRepo: jest.Mocked<ManualRecordRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const generateDummyManualRecord = (
  participantId: string,
  value: number = Math.floor(Math.random() * 10000),
  recorderName: string = "테스트 계수자"
): ManualRecord => ({
  id: uuidv4(),
  participantId,
  value,
  recorderName,
  createdAt: new Date(),
});

describe("ManualRecordService 구현체 단위 테스트", () => {
  let service: ManualRecordServiceImpl;
  let adminActor: Actor;
  let manualRecorderActor: Actor;
  let anonymousActor: Actor;

  beforeAll(() => {
    // Arrange - 테스트용 액터들 생성
    adminActor = {
      id: uuidv4(),
      name: "관리자",
      roles: ["administrator"],
      createdAt: new Date(),
    };
    manualRecorderActor = {
      id: uuidv4(),
      name: "수동 계수자",
      roles: ["manualRecorder"],
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
    // Arrange - 각 테스트 전에 모의 객체 초기화
    jest.clearAllMocks();
    service = new ManualRecordServiceImpl({
      manualRecordRepository: mockManualRecordRepo,
    });
  });

  it("아무나 특정 참가자의 수동 계수 기록을 조회할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const manualRecords: ManualRecord[] = [];
    for (let i = 0; i < 5; i++) {
      manualRecords.push(generateDummyManualRecord(participantId));
    }
    mockManualRecordRepo.getByParticipantId.mockResolvedValue(manualRecords);

    // Act
    const result = await service.getManualRecords(
      anonymousActor,
      participantId
    );

    // Assert
    expect(result).toEqual(manualRecords);
    expect(mockManualRecordRepo.getByParticipantId).toHaveBeenCalledWith(
      participantId
    );
  });

  it("관리자와 수동 계수자만 수동 계수 기록을 추가할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const value = 5000;
    const recorderName = "테스트 계수자";
    const manualRecord = generateDummyManualRecord(
      participantId,
      value,
      recorderName
    );
    mockManualRecordRepo.create.mockResolvedValue(manualRecord);

    // Act & Assert - 익명 사용자는 권한 없음
    await expect(
      service.addManualRecord(
        anonymousActor,
        participantId,
        value,
        recorderName
      )
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert - 관리자는 권한 있음
    await expect(
      service.addManualRecord(adminActor, participantId, value, recorderName)
    ).resolves.toBe(manualRecord);

    // Act & Assert - 수동 계수자는 권한 있음
    await expect(
      service.addManualRecord(
        manualRecorderActor,
        participantId,
        value,
        recorderName
      )
    ).resolves.toBe(manualRecord);
  });

  it("수동 계수 기록 추가 시 올바른 데이터가 저장된다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const value = 7500;
    const recorderName = "김계수";
    const manualRecord = generateDummyManualRecord(
      participantId,
      value,
      recorderName
    );
    mockManualRecordRepo.create.mockResolvedValue(manualRecord);

    // Act
    const result = await service.addManualRecord(
      adminActor,
      participantId,
      value,
      recorderName
    );

    // Assert
    expect(result).toEqual(manualRecord);
    expect(mockManualRecordRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        participantId,
        value,
        recorderName,
        createdAt: expect.any(Date),
      })
    );
  });

  describe("수동 계수 기록 추가 이벤트 구독 테스트", () => {
    let participantId: string;
    let callback1Unsubscriber: Unsubscriber;
    let callback2Unsubscriber: Unsubscriber;
    let callback1: jest.Mock;
    let callback2: jest.Mock;

    beforeEach(() => {
      // Arrange
      participantId = uuidv4();
      callback1 = jest.fn();
      callback2 = jest.fn();
      callback1Unsubscriber = service.subscribeManualRecordAdded(
        participantId,
        callback1
      );
      callback2Unsubscriber = service.subscribeManualRecordAdded(
        participantId,
        callback2
      );
    });

    afterEach(() => {
      callback1Unsubscriber();
      callback2Unsubscriber();
      jest.clearAllMocks();
    });

    it("수동 계수 기록이 추가되면 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const manualRecord = generateDummyManualRecord(participantId);
      mockManualRecordRepo.create.mockResolvedValue(manualRecord);

      // Act
      await service.addManualRecord(
        adminActor,
        participantId,
        1000,
        "테스트 계수자"
      );

      // Assert
      expect(callback1).toHaveBeenCalledWith(manualRecord);
      expect(callback2).toHaveBeenCalledWith(manualRecord);
    });

    it("구독 함수에서 오류가 발생해도 서비스 로직은 정상적으로 동작한다.", async () => {
      // Arrange
      const manualRecord = generateDummyManualRecord(participantId);
      mockManualRecordRepo.create.mockResolvedValue(manualRecord);
      callback1.mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const asyncTask = service.addManualRecord(
        adminActor,
        participantId,
        1000,
        "테스트 계수자"
      );

      // Assert
      await expect(asyncTask).resolves.toBe(manualRecord);
      expect(callback1).toHaveBeenCalledWith(manualRecord);
      expect(callback2).toHaveBeenCalledWith(manualRecord);

      // Cleanup
      errorSpy.mockRestore();
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const manualRecord = generateDummyManualRecord(participantId);
      mockManualRecordRepo.create.mockResolvedValue(manualRecord);
      callback1Unsubscriber();

      // Act
      await service.addManualRecord(
        manualRecorderActor,
        participantId,
        1000,
        "테스트 계수자"
      );

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(manualRecord);
    });
  });
});
