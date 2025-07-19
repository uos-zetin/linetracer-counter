import { ManualRecord, Participant, Record } from "@/core/models";
import {
  ManualRecordRepository,
  ParticipantRepository,
  RecordRepository,
} from "@/core/repositories";
import { ParticipantService } from "@/core/services/participant";

import { v4 as uuidv4 } from "uuid";

const mockParticipantRepo: jest.Mocked<ParticipantRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByDivisionId: jest.fn(),
};

const mockRecordRepo: jest.Mocked<RecordRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const mockManualRecordRepo: jest.Mocked<ManualRecordRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const generateDummyParticipant = (
  count: number,
  divisionId: string
): Participant => ({
  id: uuidv4(),
  divisionId,
  name: `김태환 ${count}호`,
  teamName: "제티",
  robotName: "멍때리기로봇",
  comment: "멍때리면서 라인트레이서를 굴려보겠습니다!",
  orderRaw: 1,
  givenTime: 4 * 60 * 1000, // 4분
  createdAt: new Date(),
});

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

describe("ParticipantService 구현체 단위 테스트", () => {
  let service: ParticipantService;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ParticipantService({
      participantRepository: mockParticipantRepo,
      recordRepository: mockRecordRepo,
      manualRecordRepository: mockManualRecordRepo,
    });
  });

  it("특정 부문의 참가자 목록을 조회할 수 있다.", async () => {
    // Arrange
    const divisionId = uuidv4();
    const participants: Participant[] = [];
    for (let i = 0; i < 10; i++) {
      participants.push(generateDummyParticipant(i, divisionId));
    }
    mockParticipantRepo.getByDivisionId.mockResolvedValue(participants);

    // Act
    const result = await service.getParticipants(divisionId);

    // Assert
    expect(result).toEqual(participants);
    expect(mockParticipantRepo.getByDivisionId).toHaveBeenCalledWith(
      divisionId
    );
  });

  it("참가자를 추가할 수 있다.", async () => {
    // Arrange
    const participant = generateDummyParticipant(0, uuidv4());
    mockParticipantRepo.create.mockResolvedValue(participant);

    // Act
    const result = await service.addParticipant(
      participant.divisionId,
      participant.name,
      participant.teamName,
      participant.robotName,
      participant.comment,
      participant.orderRaw,
      participant.givenTime
    );

    // Assert
    expect(result).toEqual(participant);
    expect(mockParticipantRepo.create).toHaveBeenCalledTimes(1);
  });

  it("참가자를 수정할 수 있다.", async () => {
    // Arrange
    const participant = generateDummyParticipant(0, uuidv4());
    mockParticipantRepo.getById.mockResolvedValue(participant);
    const data = {
      name: "수정된 이름",
      teamName: "수정된 팀명",
      robotName: "수정된 로봇명",
      comment: "수정된 코멘트",
      orderRaw: 999,
      givenTime: 10 * 60 * 1000, // 10분
    };
    const updatedParticipant: Participant = {
      ...participant,
      ...data,
    };
    mockParticipantRepo.update.mockResolvedValue(updatedParticipant);

    // Act
    const result = await service.updateParticipant(participant.id, data);

    // Assert
    expect(result).toEqual(updatedParticipant);
    expect(mockParticipantRepo.update).toHaveBeenCalledTimes(1);
  });

  it("참가자를 삭제할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    mockParticipantRepo.delete.mockResolvedValue();

    // Act
    await service.deleteParticipant(participantId);

    // Assert
    expect(mockParticipantRepo.delete).toHaveBeenCalledWith(participantId);
  });

  it("특정 참가자의 기록을 조회할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const records: Record[] = [];
    for (let i = 0; i < 5; i++) {
      records.push(generateDummyRecord(participantId));
    }
    mockRecordRepo.getByParticipantId.mockResolvedValue(records);

    // Act
    const result = await service.getRecords(participantId);

    // Assert
    expect(result).toEqual(records);
    expect(mockRecordRepo.getByParticipantId).toHaveBeenCalledWith(
      participantId
    );
  });

  it("참가자에 대한 기록을 추가할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const record = generateDummyRecord(participantId);
    mockRecordRepo.create.mockResolvedValue(record);

    // Act
    const result = await service.addRecord(
      participantId,
      record.value,
      record.source,
      record.note
    );

    // Assert
    expect(result).toEqual(record);
    expect(mockRecordRepo.create).toHaveBeenCalledTimes(1);
  });

  it("기록의 비고를 수정할 수 있다.", async () => {
    // Arrange
    const record = generateDummyRecord(uuidv4());
    const updatedRecord = { ...record, note: "수정된 비고" };
    mockRecordRepo.getById.mockResolvedValue(record);
    mockRecordRepo.update.mockResolvedValue(updatedRecord);

    // Act
    const result = await service.setRecordNote(record.id, "수정된 비고");

    // Assert
    expect(result).toEqual(updatedRecord);
    expect(mockRecordRepo.update).toHaveBeenCalledTimes(1);
  });

  it("기록의 상태를 변경할 수 있다.", async () => {
    // Arrange
    const record = generateDummyRecord(uuidv4());
    const updatedRecord = { ...record, status: "approved" as const };
    mockRecordRepo.getById.mockResolvedValue(record);
    mockRecordRepo.update.mockResolvedValue(updatedRecord);

    // Act
    const result = await service.setRecordStatus(record.id, "approved");

    // Assert
    expect(result).toEqual(updatedRecord);
    expect(mockRecordRepo.update).toHaveBeenCalledTimes(1);
  });

  it("특정 참가자의 수동 계수 기록을 조회할 수 있다.", async () => {
    // Arrange
    const participantId = uuidv4();
    const manualRecords: ManualRecord[] = [];
    for (let i = 0; i < 5; i++) {
      manualRecords.push(generateDummyManualRecord(participantId));
    }
    mockManualRecordRepo.getByParticipantId.mockResolvedValue(manualRecords);

    // Act
    const result = await service.getManualRecords(participantId);

    // Assert
    expect(result).toEqual(manualRecords);
    expect(mockManualRecordRepo.getByParticipantId).toHaveBeenCalledWith(
      participantId
    );
  });

  it("참가자에 대한 수동 계수 기록을 추가할 수 있다.", async () => {
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

    // Act
    const result = await service.addManualRecord(
      participantId,
      value,
      recorderName
    );

    // Assert
    expect(result).toEqual(manualRecord);
    expect(mockManualRecordRepo.create).toHaveBeenCalledTimes(1);
  });

  it("참가자가 업데이트되었을 때 구독자에게 알림을 보낸다.", async () => {
    // Arrange
    const participant = generateDummyParticipant(0, uuidv4());
    mockParticipantRepo.getById.mockResolvedValue(participant);

    const callback1 = jest.fn();
    const unsubscriber1 = service.subscribeParticipantUpdated(
      participant.id,
      callback1
    );
    const callback2 = jest
      .fn()
      .mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
    const unsubscriber2 = service.subscribeParticipantUpdated(
      participant.id,
      callback2
    );

    // Act & Assert - 참가자 정보가 업데이트되었을 때 구독자에게 알림을 보낸다.
    const updatedParticipant: Participant = {
      ...participant,
      name: "수정된 이름 1",
    };
    mockParticipantRepo.update.mockResolvedValue(updatedParticipant);
    await service.updateParticipant(participant.id, {
      name: "수정된 이름 1",
    });
    expect(callback1).toHaveBeenNthCalledWith(1, updatedParticipant);
    expect(callback2).toHaveBeenNthCalledWith(1, updatedParticipant);

    // 이벤트 리스너 제거가 잘 되는지 확인한다.
    unsubscriber2();
    mockParticipantRepo.update.mockResolvedValue({
      ...participant,
      name: "수정된 이름 2",
    });
    await service.updateParticipant(participant.id, {
      name: "수정된 이름 2",
    });
    expect(callback1).toHaveBeenCalledTimes(2);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  describe("기록 상태 변경 이벤트 구독 테스트", () => {
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
      await service.setRecordStatus(record.id, "approved");

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

      // Act
      const asyncTask = service.addRecord(
        participantId,
        record.value,
        record.source,
        record.note
      );

      // Assert
      await expect(asyncTask).resolves.toBe(record);
      expect(callback1).toHaveBeenCalledWith(record);
      expect(callback2).toHaveBeenCalledWith(record);
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const record = generateDummyRecord(participantId);
      mockRecordRepo.create.mockResolvedValue(record);
      callback1Unsubscriber();

      // Act
      await service.addRecord(
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

  describe("수동 계수 기록 추가 이벤트 구독 테스트", () => {
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
      await service.addManualRecord(participantId, 1000, "테스트 계수자");

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

      // Act
      const asyncTask = service.addManualRecord(
        participantId,
        1000,
        "테스트 계수자"
      );

      // Assert
      await expect(asyncTask).resolves.toBe(manualRecord);
      expect(callback1).toHaveBeenCalledWith(manualRecord);
      expect(callback2).toHaveBeenCalledWith(manualRecord);
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const manualRecord = generateDummyManualRecord(participantId);
      mockManualRecordRepo.create.mockResolvedValue(manualRecord);
      callback1Unsubscriber();

      // Act
      await service.addManualRecord(participantId, 1000, "테스트 계수자");

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(manualRecord);
    });
  });
});
