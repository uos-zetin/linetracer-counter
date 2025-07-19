import { AuthorizationError } from "@/core/errors";
import { Actor, Participant, Record } from "@/core/models";
import { ParticipantRepository, RecordRepository } from "@/core/repositories";

import { RecordServiceImpl } from "@/core/services/record";

import { v4 as uuidv4 } from "uuid";

const mockRecordRepo: jest.Mocked<RecordRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const mockParticipantRepo: jest.Mocked<ParticipantRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByDivisionId: jest.fn(),
};

const generateDummyRecord = (
  participantId: string,
  value: number = Math.floor(Math.random() * 10000)
): Record => ({
  id: uuidv4(),
  participantId,
  value,
  source: "stopwatch" as const,
  status: "pending" as const,
  note: "테스트 기록",
  createdAt: new Date(),
});

const generateDummyParticipant = (
  divisionId: string,
  name: string = "테스트 참가자"
): Participant => ({
  id: uuidv4(),
  divisionId,
  name,
  teamName: "테스트 팀",
  robotName: "테스트 로봇",
  comment: "테스트 코멘트",
  orderRaw: 1,
  givenTime: 4 * 60 * 1000, // 4분
  createdAt: new Date(),
});

describe("RecordService 구현체 단위 테스트", () => {
  let service: RecordServiceImpl;
  let adminActor: Actor;
  let stopwatchRecorderActor: Actor;
  let anonymousActor: Actor;

  beforeAll(() => {
    adminActor = {
      id: uuidv4(),
      name: "관리자",
      roles: ["administrator"],
      createdAt: new Date(),
    };
    stopwatchRecorderActor = {
      id: uuidv4(),
      name: "계수기",
      roles: ["stopwatchRecorder"],
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
    service = new RecordServiceImpl({
      recordRepository: mockRecordRepo,
      participantRepository: mockParticipantRepo,
    });
  });

  it("아무나 특정 참가자의 기록을 조회할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const records: Record[] = [];
    for (let i = 0; i < 5; i++) {
      records.push(generateDummyRecord(participantId));
    }
    mockRecordRepo.getByParticipantId.mockResolvedValue(records);

    // Act
    const result = await service.getRecords(anonymousActor, participantId);

    // Assert
    expect(result).toEqual(records);
  });

  it("관리자와 계수기만 기록을 추가할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const record = generateDummyRecord(participantId);
    mockRecordRepo.create.mockResolvedValue(record);

    // Act & Assert - 익명 사용자는 권한 없음
    await expect(
      service.addRecord(
        anonymousActor,
        participantId,
        record.value,
        record.source,
        record.note
      )
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert - 관리자는 권한 있음
    const adminResult = await service.addRecord(
      adminActor,
      participantId,
      record.value,
      record.source,
      record.note
    );
    expect(adminResult).toEqual(record);

    // Act & Assert - 계수기는 권한 있음
    const recorderResult = await service.addRecord(
      stopwatchRecorderActor,
      participantId,
      record.value,
      record.source,
      record.note
    );
    expect(recorderResult).toEqual(record);
    expect(mockRecordRepo.create).toHaveBeenCalledTimes(2);
  });

  it("관리자만 기록의 비고를 수정할 수 있다.", async () => {
    // Arrange
    const record = generateDummyRecord(uuidv4());
    const updatedRecord = { ...record, note: "수정된 비고" };
    mockRecordRepo.getById.mockResolvedValue(record);
    mockRecordRepo.update.mockResolvedValue(updatedRecord);

    // Act & Assert - 익명 사용자는 권한 없음
    await expect(
      service.setRecordNote(anonymousActor, record.id, "수정된 비고")
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert - 관리자는 권한 있음
    const result = await service.setRecordNote(
      adminActor,
      record.id,
      "수정된 비고"
    );
    expect(result).toEqual(updatedRecord);
    expect(mockRecordRepo.update).toHaveBeenCalledTimes(1);
  });

  it("관리자만 기록의 상태를 변경할 수 있다.", async () => {
    // Arrange
    const record = generateDummyRecord(uuidv4());
    const updatedRecord = { ...record, status: "approved" as const };
    mockRecordRepo.getById.mockResolvedValue(record);
    mockRecordRepo.update.mockResolvedValue(updatedRecord);

    // Act & Assert - 익명 사용자는 권한 없음
    await expect(
      service.setRecordStatus(anonymousActor, record.id, "approved")
    ).rejects.toThrow(AuthorizationError);

    // Act & Assert - 관리자는 권한 있음
    const result = await service.setRecordStatus(
      adminActor,
      record.id,
      "approved"
    );
    expect(result).toEqual(updatedRecord);
    expect(mockRecordRepo.update).toHaveBeenCalledTimes(1);
  });

  it("특정 부문의 상위 기록을 조회할 수 있다.", async () => {
    // arrange
    const divisionId = uuidv4();
    const mockParticipants = [
      generateDummyParticipant(divisionId, "참가자1"),
      generateDummyParticipant(divisionId, "참가자2"),
    ];
    mockParticipantRepo.getByDivisionId.mockResolvedValue(mockParticipants);
    const mockRecords: Record[] = [
      generateDummyRecord(mockParticipants[0].id, 13000),
      generateDummyRecord(mockParticipants[0].id, 3000),
      generateDummyRecord(mockParticipants[1].id, 1000),
      generateDummyRecord(mockParticipants[1].id, 2000),
    ].map((r) => ({ ...r, status: "approved" }));
    mockRecords.push({
      // 무효화된 기록은 상위 기록에 포함되지 않는다.
      ...generateDummyRecord(mockParticipants[0].id, 1000),
      status: "rejected",
    });
    mockRecordRepo.getByParticipantId.mockImplementation(
      (participantId: string) => {
        const records = mockRecords.filter(
          (r) => r.participantId === participantId
        );
        return Promise.resolve(records);
      }
    );

    // act
    const result = await service.getTopRecordsByDivision(
      adminActor,
      divisionId
    );

    // assert
    expect(result.map((r) => [r.participantId, r.value])).toEqual([
      [mockParticipants[1].id, 1000],
      [mockParticipants[0].id, 3000],
    ]);
  });

  describe("참가자 기록 갱신 이벤트 구독 테스트", () => {
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
      callback1Unsubscriber = service.subscribeRecordStatusChanged(
        participantId,
        callback1
      );
      callback2Unsubscriber = service.subscribeRecordStatusChanged(
        participantId,
        callback2
      );
    });

    afterEach(() => {
      callback1Unsubscriber();
      callback2Unsubscriber();
      jest.clearAllMocks();
    });

    it("기록이 추가되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const record = generateDummyRecord(participantId);
      mockRecordRepo.create.mockResolvedValue(record);

      // Act
      await service.addRecord(
        adminActor,
        participantId,
        record.value,
        record.source,
        record.note
      );

      // Assert
      expect(callback1).toHaveBeenCalledWith(record);
      expect(callback2).toHaveBeenCalledWith(record);
    });

    it("기록 상태가 변경되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const record = generateDummyRecord(participantId);
      mockRecordRepo.getById.mockResolvedValue(record);
      const updatedRecord = { ...record, status: "approved" as const };
      mockRecordRepo.update.mockResolvedValue(updatedRecord);

      // Act
      await service.setRecordStatus(adminActor, record.id, "approved");

      // Assert
      expect(callback1).toHaveBeenCalledWith(updatedRecord);
      expect(callback2).toHaveBeenCalledWith(updatedRecord);
    });

    it("구독 함수에서 오류가 발생해도 서비스 로직은 정상적으로 동작한다.", async () => {
      // Arrange
      const record = generateDummyRecord(participantId);
      mockRecordRepo.create.mockResolvedValue(record);
      callback1.mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
      const errorSpy = jest // 오류 메시지 출력 방지
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Act
      const asyncTask = service.addRecord(
        adminActor,
        participantId,
        record.value,
        record.source,
        record.note
      );

      // Assert
      await expect(asyncTask).resolves.toBe(record);
      expect(callback1).toHaveBeenCalledWith(record);
      expect(callback2).toHaveBeenCalledWith(record);

      // Cleanup
      errorSpy.mockRestore();
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const record = generateDummyRecord(participantId);
      mockRecordRepo.create.mockResolvedValue(record);
      callback1Unsubscriber();

      // Act
      await service.addRecord(
        adminActor,
        participantId,
        record.value,
        record.source,
        record.note
      );

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(record);
    });
  });
});
