import { DivisionStatusError, TimerLogConsecutiveError } from "@/core/errors";
import {
  Division,
  ManualRecord,
  Participant,
  Record,
  TimerLog,
} from "@/core/models";
import {
  DivisionRepository,
  ManualRecordRepository,
  ParticipantRepository,
  RecordRepository,
  TimerLogRepository,
} from "@/core/repositories";
import { ParticipantService } from "@/core/services/participant";

import { v4 as uuidv4 } from "uuid";

const mockDivisionRepo: jest.Mocked<DivisionRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByCompetitionId: jest.fn(),
};

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

const mockTimerLogRepo: jest.Mocked<TimerLogRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByParticipantId: jest.fn(),
};

const generateDivision = (name: string): Division => ({
  id: uuidv4(),
  competitionId: uuidv4(),
  name,
  description: `${name} 설명`,
  createdAt: new Date(),
  status: "ready",
});

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

describe("ParticipantService 단위 테스트", () => {
  let service: ParticipantService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ParticipantService({
      divisionRepository: mockDivisionRepo,
      participantRepository: mockParticipantRepo,
      recordRepository: mockRecordRepo,
      manualRecordRepository: mockManualRecordRepo,
      timerLogRepository: mockTimerLogRepo,
    });
  });

  describe("참가자 관리", () => {
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
      const division = generateDivision("부문 1");
      const participant = generateDummyParticipant(0, division.id);
      mockParticipantRepo.create.mockResolvedValue(participant);
      mockDivisionRepo.getById.mockResolvedValue(division);

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
      expect(mockParticipantRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          divisionId: participant.divisionId,
          name: participant.name,
          teamName: participant.teamName,
          robotName: participant.robotName,
          comment: participant.comment,
          orderRaw: participant.orderRaw,
          givenTime: participant.givenTime,
        })
      );
      expect(mockDivisionRepo.getById).toHaveBeenCalledWith(
        participant.divisionId
      );
    });

    it("준비 상태가 아닌 부문에 참가자를 추가할 수 없다.", async () => {
      // Arrange
      const division = generateDivision("부문 1");
      const participant = generateDummyParticipant(0, division.id);
      mockDivisionRepo.getById.mockResolvedValue({
        ...division,
        status: "ongoing",
      });

      // Act
      const asyncTask = service.addParticipant(
        participant.divisionId,
        participant.name,
        participant.teamName,
        participant.robotName,
        participant.comment,
        participant.orderRaw,
        participant.givenTime
      );

      // Assert
      await expect(asyncTask).rejects.toThrow(DivisionStatusError);
      expect(mockParticipantRepo.create).not.toHaveBeenCalled();
    });

    it("특정 참가자를 조회할 수 있다.", async () => {
      // Arrange
      const participant = generateDummyParticipant(0, uuidv4());
      mockParticipantRepo.getById.mockResolvedValue(participant);

      // Act
      const result = await service.getParticipant(participant.id);

      // Assert
      expect(result).toEqual(participant);
      expect(mockParticipantRepo.getById).toHaveBeenCalledWith(participant.id);
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
      expect(mockParticipantRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
        })
      );
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
  });

  describe("기록 관리", () => {
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
      expect(mockRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId,
          value: record.value,
          source: record.source,
          note: record.note,
        })
      );
    });

    it("기록의 비고를 수정할 수 있다.", async () => {
      // Arrange
      const record = generateDummyRecord(uuidv4());
      const note = "수정된 비고";
      const updatedRecord = { ...record, note };
      mockRecordRepo.getById.mockResolvedValue(record);
      mockRecordRepo.update.mockResolvedValue(updatedRecord);

      // Act
      const result = await service.setRecordNote(record.id, note);

      // Assert
      expect(result).toEqual(updatedRecord);
      expect(mockRecordRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ note })
      );
    });

    it("기록의 상태를 변경할 수 있다.", async () => {
      // Arrange
      const record = generateDummyRecord(uuidv4());
      const status = "approved" as const;
      const updatedRecord = { ...record, status };
      mockRecordRepo.getById.mockResolvedValue(record);
      mockRecordRepo.update.mockResolvedValue(updatedRecord);

      // Act
      const result = await service.setRecordStatus(record.id, status);

      // Assert
      expect(result).toEqual(updatedRecord);
      expect(mockRecordRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ status })
      );
    });
  });

  describe("수동 계수 기록 관리", () => {
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
      expect(mockManualRecordRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId,
          value,
          recorderName,
        })
      );
    });
  });

  describe("타이머 관리", () => {
    it("특정 참가자의 타이머 로그를 조회할 수 있다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const timerLogs: TimerLog[] = [
        generateDummyTimerLog(participantId, "start", Date.now()),
        generateDummyTimerLog(participantId, "stop", Date.now()),
      ];
      mockTimerLogRepo.getByParticipantId.mockResolvedValue(timerLogs);

      // Act
      const result = await service.getTimerLogs(participantId);

      // Assert
      expect(result).toEqual(timerLogs);
      expect(mockTimerLogRepo.getByParticipantId).toHaveBeenCalledWith(
        participantId
      );
    });

    it("타이머를 시작할 수 있다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const timerLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now()
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      mockTimerLogRepo.getByParticipantId.mockResolvedValue([]); // 빈 배열로 시작 상태

      // Act
      const result = await service.startTimer(participantId);

      // Assert
      expect(result).toEqual(timerLog);
      expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId,
          type: "start",
        })
      );
    });

    it("타이머를 중지할 수 있다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const startLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now() - 1000
      );
      const timerLog = generateDummyTimerLog(participantId, "stop", Date.now());
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      mockTimerLogRepo.getByParticipantId.mockResolvedValue([startLog]); // 시작 로그만 있음

      // Act
      const result = await service.stopTimer(participantId);

      // Assert
      expect(result).toEqual(timerLog);
      expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId,
          type: "stop",
        })
      );
    });

    it("타이머를 조정할 수 있다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const adjustmentMs = 5000;
      const timerLog = generateDummyTimerLog(
        participantId,
        "adjust",
        adjustmentMs
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);

      // Act
      const result = await service.adjustTimer(participantId, adjustmentMs);

      // Assert
      expect(result).toEqual(timerLog);
      expect(mockTimerLogRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          participantId,
          type: "adjust",
          value: adjustmentMs,
        })
      );
    });

    it("이미 실행 중인 타이머를 시작하려고 하면 에러가 발생한다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const startLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now() - 1000
      );
      mockTimerLogRepo.getByParticipantId.mockResolvedValue([startLog]); // 시작 로그만 있음

      // Act & Assert
      await expect(service.startTimer(participantId)).rejects.toThrow(
        TimerLogConsecutiveError
      );
    });

    it("실행 중이지 않은 타이머를 중지하려고 하면 에러가 발생한다.", async () => {
      // Arrange
      const participantId = uuidv4();
      mockTimerLogRepo.getByParticipantId.mockResolvedValue([]); // 빈 배열

      // Act & Assert
      await expect(service.stopTimer(participantId)).rejects.toThrow(
        TimerLogConsecutiveError
      );
    });
  });

  describe("이벤트 구독", () => {
    it("참가자가 업데이트되었을 때 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const participant = generateDummyParticipant(0, uuidv4());
      mockParticipantRepo.getById.mockResolvedValue(participant);
      const callback = jest.fn();
      const updatedParticipant: Participant = {
        ...participant,
        name: "수정된 이름",
      };
      mockParticipantRepo.update.mockResolvedValue(updatedParticipant);

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participant.id,
        callback
      );
      await service.updateParticipant(participant.id, {
        name: "수정된 이름",
      });

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "updated",
        participant: updatedParticipant,
      });

      // Cleanup
      unsubscribe();
    });

    it("기록이 추가되었을 때 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const record = generateDummyRecord(participantId);
      mockRecordRepo.create.mockResolvedValue(record);
      const callback = jest.fn();

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participantId,
        callback
      );
      await service.addRecord(
        participantId,
        record.value,
        record.source,
        record.note
      );

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "record-updated",
        record: record,
      });

      // Cleanup
      unsubscribe();
    });

    it("수동 계수 기록이 추가되었을 때 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const manualRecord = generateDummyManualRecord(participantId);
      mockManualRecordRepo.create.mockResolvedValue(manualRecord);
      const callback = jest.fn();

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participantId,
        callback
      );
      await service.addManualRecord(
        participantId,
        manualRecord.value,
        manualRecord.recorderName
      );

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "manual-record-added",
        manualRecord: manualRecord,
      });

      // Cleanup
      unsubscribe();
    });

    it("타이머 로그가 추가되었을 때 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const participantId = uuidv4();
      const timerLog = generateDummyTimerLog(
        participantId,
        "start",
        Date.now()
      );
      mockTimerLogRepo.create.mockResolvedValue(timerLog);
      mockTimerLogRepo.getByParticipantId.mockResolvedValue([]);
      const callback = jest.fn();

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participantId,
        callback
      );
      await service.startTimer(participantId);

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "timer-log-added",
        timerLog: timerLog,
      });

      // Cleanup
      unsubscribe();
    });

    it("참가자가 삭제되었을 때 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      const participantId = uuidv4();
      mockParticipantRepo.delete.mockResolvedValue();
      const callback = jest.fn();

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participantId,
        callback
      );
      await service.deleteParticipant(participantId);

      // Assert
      expect(callback).toHaveBeenCalledWith({
        type: "deleted",
      });

      // Cleanup
      unsubscribe();
    });

    it("구독 함수에서 오류가 발생해도 서비스 로직은 정상적으로 동작한다.", async () => {
      // Arrange
      const spyOnError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const participant = generateDummyParticipant(0, uuidv4());
      mockParticipantRepo.getById.mockResolvedValue(participant);
      const callback = jest
        .fn()
        .mockRejectedValue(
          new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
        );
      const updatedParticipant: Participant = {
        ...participant,
        name: "수정된 이름",
      };
      mockParticipantRepo.update.mockResolvedValue(updatedParticipant);

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participant.id,
        callback
      );
      const asyncTask = service.updateParticipant(participant.id, {
        name: "수정된 이름",
      });

      // Assert
      await expect(asyncTask).resolves.toBe(updatedParticipant);
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
      spyOnError.mockRestore();
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      const participant = generateDummyParticipant(0, uuidv4());
      mockParticipantRepo.getById.mockResolvedValue(participant);
      const callback = jest.fn();
      const updatedParticipant: Participant = {
        ...participant,
        name: "수정된 이름",
      };
      mockParticipantRepo.update.mockResolvedValue(updatedParticipant);

      // Act
      const unsubscribe = service.subscribeParticipantEvent(
        participant.id,
        callback
      );
      unsubscribe();
      await service.updateParticipant(participant.id, {
        name: "수정된 이름",
      });

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it("여러 개의 이벤트 핸들러를 등록할 수 있다.", async () => {
      // Arrange
      const participant = generateDummyParticipant(0, uuidv4());
      mockParticipantRepo.delete.mockResolvedValue();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      // Act
      const unsubscribe1 = service.subscribeParticipantEvent(
        participant.id,
        callback1
      );
      const unsubscribe2 = service.subscribeParticipantEvent(
        participant.id,
        callback2
      );
      await service.deleteParticipant(participant.id);

      // Assert
      expect(callback1).toHaveBeenCalledWith({
        type: "deleted",
      });
      expect(callback2).toHaveBeenCalledWith({
        type: "deleted",
      });

      // Cleanup
      unsubscribe1();
      unsubscribe2();
    });
  });
});
