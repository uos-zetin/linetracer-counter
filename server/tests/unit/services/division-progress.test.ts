import {
  DivisionStatusError,
  RunnerNotParticipatedError,
  RunnerNotSetError,
} from "@/core/errors";
import {
  DivisionProgressState,
  DivisionProgressStateStore,
} from "@/core/interfaces";
import {
  Competition,
  Division,
  ManualRecord,
  Participant,
  Record,
  TimerLog,
} from "@/core/models";
import {
  CompetitionService,
  DivisionEventCallback,
} from "@/core/services/competition";
import { DivisionProgressService } from "@/core/services/division-progress";
import {
  ParticipantEventCallback,
  ParticipantService,
} from "@/core/services/participant";

import { v4 as uuidv4 } from "uuid";

const mockCompetitionService: jest.Mocked<CompetitionService> = {
  getDivision: jest.fn(),
  setDivisionStatus: jest.fn(),
  getCompetition: jest.fn(),
  getTopRecordsByDivision: jest.fn(),
  subscribeDivisionEvent: jest.fn(),
} as any;

const mockParticipantService: jest.Mocked<ParticipantService> = {
  getParticipants: jest.fn(),
  getParticipant: jest.fn(),
  getTimerLogs: jest.fn(),
  getRecords: jest.fn(),
  addRecord: jest.fn(),
  getManualRecords: jest.fn(),
  subscribeParticipantEvent: jest.fn(),
} as any;

const mockStateStore: jest.Mocked<DivisionProgressStateStore> = {
  getState: jest.fn(),
  setState: jest.fn(),
  resetState: jest.fn(),
};

const generateDummyDivision = (
  competitionId: string,
  status: "ready" | "ongoing" | "closed" = "ready"
): Division => ({
  id: uuidv4(),
  competitionId,
  name: "테스트 부문",
  description: "테스트 부문 설명",
  status,
  createdAt: new Date(),
});

const generateDummyCompetition = () => ({
  id: uuidv4(),
  name: "테스트 대회",
  description: "테스트 대회 설명",
  createdAt: new Date(),
});

const generateDummyParticipant = (
  divisionId: string,
  orderRaw: number = 1
): Participant => ({
  id: uuidv4(),
  divisionId,
  name: `참가자 ${orderRaw}`,
  teamName: "테스트 팀",
  robotName: "테스트 로봇",
  comment: "테스트 코멘트",
  orderRaw,
  givenTime: 4 * 60 * 1000, // 4분
  createdAt: new Date(),
});

const generateDummyTimerLog = (participantId: string): TimerLog => ({
  id: uuidv4(),
  participantId,
  value: Date.now(),
  type: "start",
  createdAt: new Date(),
});

const generateDummyRecord = (participantId: string): Record => ({
  id: uuidv4(),
  participantId,
  value: Math.floor(Math.random() * 10000),
  source: "stopwatch",
  status: "pending",
  note: "테스트 기록",
  createdAt: new Date(),
});

const generateDummyManualRecord = (participantId: string): ManualRecord => ({
  id: uuidv4(),
  participantId,
  value: Math.floor(Math.random() * 100),
  recorderName: "테스트 계수자",
  createdAt: new Date(),
});

describe("DivisionProgressService 단위 테스트", () => {
  let service: DivisionProgressService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DivisionProgressService({
      competitionService: mockCompetitionService,
      participantService: mockParticipantService,
      divisionProgressStateStore: mockStateStore,
    });
  });

  describe("openDivision", () => {
    it("대회 부문을 시작할 수 있다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ready");
      const participants = [
        generateDummyParticipant(division.id, 101),
        generateDummyParticipant(division.id, 100),
        generateDummyParticipant(division.id, 102),
      ];
      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockParticipantService.getParticipants.mockResolvedValue([
        ...participants, // copy
      ]);
      mockStateStore.setState.mockResolvedValue(undefined);
      mockCompetitionService.setDivisionStatus.mockResolvedValue(division);

      // Act
      await service.openDivision(division.id);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: null,
        participantOrder: [
          participants[1].id,
          participants[0].id,
          participants[2].id,
        ], // orderRaw 순으로 정렬되어야 한다.
      });
      expect(mockCompetitionService.setDivisionStatus).toHaveBeenCalledWith(
        division.id,
        "ongoing"
      );
    });

    it("이미 ongoing 상태인 부문은 다시 시작하지 않는다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ongoing");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      await service.openDivision(division.id);

      // Assert
      expect(mockStateStore.setState).not.toHaveBeenCalled();
      expect(mockCompetitionService.setDivisionStatus).not.toHaveBeenCalled();
    });
  });

  describe("closeDivision", () => {
    it("대회 부문을 종료할 수 있다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ongoing");
      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockStateStore.resetState.mockResolvedValue(undefined);
      mockCompetitionService.setDivisionStatus.mockResolvedValue(division);

      // Act
      await service.closeDivision(division.id);

      // Assert
      expect(mockStateStore.resetState).toHaveBeenCalledWith(division.id);
      expect(mockCompetitionService.setDivisionStatus).toHaveBeenCalledWith(
        division.id,
        "closed"
      );
    });

    it("이미 closed 상태인 부문은 다시 종료하지 않는다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "closed");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      await service.closeDivision(division.id);

      // Assert
      expect(mockStateStore.resetState).not.toHaveBeenCalled();
      expect(mockCompetitionService.setDivisionStatus).not.toHaveBeenCalled();
    });
  });

  describe("resetDivision", () => {
    it("대회 부문을 초기화할 수 있다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ongoing");
      mockStateStore.resetState.mockResolvedValue(undefined);
      mockCompetitionService.setDivisionStatus.mockResolvedValue({
        ...division,
        status: "ready",
      });

      // Act
      await service.resetDivision(division.id);

      // Assert
      expect(mockStateStore.resetState).toHaveBeenCalledWith(division.id);
      expect(mockCompetitionService.setDivisionStatus).toHaveBeenCalledWith(
        division.id,
        "ready"
      );
    });
  });

  describe("setRunner", () => {
    it("현재 경연자를 설정할 수 있다.", async () => {
      // Arrange
      const runnerId = uuidv4();
      const division = generateDummyDivision(uuidv4(), "ongoing");
      const meta = {
        runnerId: null,
        participantOrder: [uuidv4(), runnerId, uuidv4()],
      };
      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.setRunner(division.id, runnerId);

      // Assert
      expect(mockStateStore.getState).toHaveBeenCalledWith(division.id);
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        ...meta,
        runnerId,
      });
    });

    it("참가하지 않은 경연자는 설정할 수 없다.", async () => {
      // Arrange
      const runnerId = uuidv4();
      const division = generateDummyDivision(uuidv4(), "ongoing");
      const meta = {
        runnerId: null,
        participantOrder: [uuidv4(), uuidv4()], // runnerId가 포함되지 않음
      };
      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockStateStore.getState.mockResolvedValue(meta);

      // Act
      const asyncTask = service.setRunner(division.id, runnerId);

      // Assert
      await expect(asyncTask).rejects.toThrow(RunnerNotParticipatedError);
    });

    it("ongoing 상태가 아닌 부문에서는 경연자를 설정할 수 없다.", async () => {
      // Arrange
      const runnerId = uuidv4();
      const division = generateDummyDivision(uuidv4(), "ready");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      const asyncTask = service.setRunner(division.id, runnerId);

      // Assert
      await expect(asyncTask).rejects.toThrow(DivisionStatusError);
    });
  });

  describe("addRecordToRunner", () => {
    it("현재 경연자에 기록을 추가할 수 있다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ongoing");
      const participant = generateDummyParticipant(division.id);
      const meta = {
        runnerId: participant.id,
        participantOrder: [uuidv4(), participant.id, uuidv4()],
      };
      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockStateStore.getState.mockResolvedValue(meta);

      // Act
      await service.addRecordToRunner(
        division.id,
        1000,
        "stopwatch",
        "테스트 기록"
      );

      // Assert
      expect(mockParticipantService.addRecord).toHaveBeenCalledWith(
        participant.id,
        1000,
        "stopwatch",
        "테스트 기록"
      );
    });
  });

  describe("postponeRunner", () => {
    let participantIds: string[];
    let division: Division;

    beforeEach(() => {
      // Arrange
      participantIds = ["0", "1", "2", "3", "4"]; // 5명
      division = generateDummyDivision(uuidv4(), "ongoing");
      mockCompetitionService.getDivision.mockResolvedValue(division);
    });

    it("현재 경연자를 마지막 순번으로 미룰 수 있다.", async () => {
      // Arrange
      const meta = {
        runnerId: "1",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.postponeRunner(division.id);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: "2", // 그 다음 경연자가 현재 경연자가 됨
        participantOrder: [
          "0",
          "2",
          "3",
          "4",
          "1", // 현재 경연자는 맨 마지막으로 미루어짐
        ],
      });
    });

    it("마지막 경연자를 미루는 경우는 순번이 변경되지 않는다.", async () => {
      // Arrange
      const meta = {
        runnerId: "4",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.postponeRunner(division.id);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: "4",
        participantOrder: [...participantIds],
      });
    });

    it("경연자가 설정되지 않은 상태에서는 미룰 수 없다.", async () => {
      // Arrange
      const meta = {
        runnerId: null,
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      const asyncTask = service.postponeRunner(division.id);

      // Assert
      await expect(asyncTask).rejects.toThrow(RunnerNotSetError);
    });

    it("ongoing 상태가 아닌 부문에서는 경연자를 미룰 수 없다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ready");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      const asyncTask = service.postponeRunner(division.id);

      // Assert
      await expect(asyncTask).rejects.toThrow(DivisionStatusError);
    });
  });

  describe("reorderParticipant", () => {
    let participantIds: string[];
    let division: Division;

    beforeEach(() => {
      // Arrange
      participantIds = ["0", "1", "2", "3", "4"]; // 5명
      division = generateDummyDivision(uuidv4(), "ongoing");
      mockCompetitionService.getDivision.mockResolvedValue(division);
    });

    it("2번째 경연자를 0번째 순번으로 이동시킨다.", async () => {
      // Arrange
      const meta = {
        runnerId: "1",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.changeParticipantOrder(division.id, "2", 0);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: "1",
        participantOrder: ["2", "0", "1", "3", "4"],
      });
    });

    it("4번째 경연자를 3번째 순번으로 이동시킨다.", async () => {
      // Arrange
      const meta = {
        runnerId: "1",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.changeParticipantOrder(division.id, "4", 3);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: "1",
        participantOrder: ["0", "1", "2", "4", "3"],
      });
    });

    it("0번째 경연자를 3번째 순번으로 이동시킨다.", async () => {
      // Arrange
      const meta = {
        runnerId: "1",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      await service.changeParticipantOrder(division.id, "0", 3);

      // Assert
      expect(mockStateStore.setState).toHaveBeenCalledWith(division.id, {
        runnerId: "1",
        participantOrder: ["1", "2", "3", "0", "4"],
      });
    });

    it("참가하지 않은 경연자는 순번을 변경할 수 없다.", async () => {
      // Arrange
      const meta = {
        runnerId: "1",
        participantOrder: [...participantIds],
      };
      mockStateStore.getState.mockResolvedValue(meta);
      mockStateStore.setState.mockResolvedValue(undefined);

      // Act
      const asyncTask = service.changeParticipantOrder(division.id, "999", 3);

      // Assert
      await expect(asyncTask).rejects.toThrow(RunnerNotParticipatedError);
      expect(mockStateStore.setState).not.toHaveBeenCalled();
    });

    it("ongoing 상태가 아닌 부문에서는 순번을 변경할 수 없다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ready");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      const asyncTask = service.changeParticipantOrder(division.id, "0", 3);

      // Assert
      await expect(asyncTask).rejects.toThrow(DivisionStatusError);
      expect(mockStateStore.setState).not.toHaveBeenCalled();
    });
  });

  describe("getDivisionProgress", () => {
    it("대회 부문의 진행 상태를 조회할 수 있다.", async () => {
      // Arrange
      const runnerId = uuidv4();
      const division = generateDummyDivision(uuidv4(), "ongoing");
      const competition = generateDummyCompetition();
      const runner = generateDummyParticipant(division.id);
      const nextRunner = generateDummyParticipant(division.id);
      const timerLogs = [generateDummyTimerLog(runnerId)];
      const records = [generateDummyRecord(runnerId)];
      const manualRecords = [generateDummyManualRecord(runnerId)];
      const topRecords = [generateDummyRecord(uuidv4())];
      const meta = {
        runnerId,
        participantOrder: [uuidv4(), runnerId, nextRunner.id],
      };

      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockCompetitionService.getCompetition.mockResolvedValue(competition);
      mockStateStore.getState.mockResolvedValue(meta);
      mockParticipantService.getParticipant.mockImplementation(async (id) => {
        if (id === runnerId) return runner;
        if (id === nextRunner.id) return nextRunner;
        return generateDummyParticipant(division.id); // 기본 참가자 반환
      });
      mockParticipantService.getTimerLogs.mockResolvedValue(timerLogs);
      mockParticipantService.getRecords.mockResolvedValue(records);
      mockParticipantService.getManualRecords.mockResolvedValue(manualRecords);
      mockCompetitionService.getTopRecordsByDivision.mockResolvedValue(
        topRecords
      );

      // Act
      const result = await service.getDivisionProgress(division.id);

      // Assert
      expect(result).toEqual({
        division,
        competition,
        runner: {
          participant: runner,
          timerLogs,
          records,
          manualRecords,
        },
        nextRunners: [nextRunner],
        topRecords,
      });
    });

    it("ongoing 상태가 아닌 부문의 진행 상태는 조회할 수 없다.", async () => {
      // Arrange
      const division = generateDummyDivision(uuidv4(), "ready");
      mockCompetitionService.getDivision.mockResolvedValue(division);

      // Act
      const asyncTask = service.getDivisionProgress(division.id);

      // Assert
      await expect(asyncTask).rejects.toThrow(DivisionStatusError);
    });
  });

  describe("subscribeDivisionProgress", () => {
    let division: Division;
    let competition: Competition;
    let runner: Participant;
    let nextRunner: Participant;
    let meta: DivisionProgressState;

    beforeEach(() => {
      // Arrange
      division = generateDummyDivision(uuidv4(), "ongoing");
      competition = generateDummyCompetition();
      runner = generateDummyParticipant(division.id);
      nextRunner = generateDummyParticipant(division.id);
      meta = {
        runnerId: runner.id,
        participantOrder: [runner.id, nextRunner.id, uuidv4()],
      };

      mockCompetitionService.getDivision.mockResolvedValue(division);
      mockCompetitionService.getCompetition.mockResolvedValue(competition);
      mockStateStore.getState.mockResolvedValue(meta);
      mockParticipantService.getParticipant.mockImplementation(async (id) => {
        if (id === runner.id) return runner;
        if (id === nextRunner.id) return nextRunner;
        return generateDummyParticipant(division.id); // 기본 참가자 반환
      });
      mockParticipantService.getTimerLogs.mockResolvedValue([]);
      mockParticipantService.getRecords.mockResolvedValue([]);
      mockParticipantService.getManualRecords.mockResolvedValue([]);
      mockCompetitionService.getTopRecordsByDivision.mockResolvedValue([]);
      mockCompetitionService.subscribeDivisionEvent.mockReturnValue(() => {});
      mockParticipantService.subscribeParticipantEvent.mockReturnValue(
        () => {}
      );
    });

    it("경연자를 바꿨을 때 기존 경연자에 대한 구독을 해제한다.", async () => {
      // Arrange
      const callback = jest.fn();
      const mockUnsubscribe = jest.fn();
      mockParticipantService.subscribeParticipantEvent.mockReturnValue(
        mockUnsubscribe
      );
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        callback
      );
      mockStateStore.getState.mockResolvedValue({
        ...meta,
        runnerId: nextRunner.id,
      });

      // Act
      await service.setRunner(division.id, nextRunner.id);

      // Assert
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1); // 기존 구독이 해제되었는지 확인
      expect(
        mockParticipantService.subscribeParticipantEvent
      ).toHaveBeenCalledTimes(2); // 초기 구독 + 새 구독

      // Cleanup
      unsubscribe();
    });

    it("경연자를 바꿨을 때 바꾼 경연자에 대한 구독이 이루어진다.", async () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        callback
      );
      mockStateStore.getState.mockResolvedValue({
        ...meta,
        runnerId: nextRunner.id,
      });

      // Act
      await service.setRunner(division.id, nextRunner.id);

      // Assert
      expect(
        mockParticipantService.subscribeParticipantEvent
      ).toHaveBeenCalledWith(nextRunner.id, expect.any(Function));
      expect(callback).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe();
    });

    it("참가자의 순서가 바뀌었을 때 콜백을 호출한다.", async () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        callback
      );
      mockStateStore.getState.mockResolvedValue({
        ...meta,
        participantOrder: [runner.id, nextRunner.id, uuidv4()],
      });

      // Act
      await service.changeParticipantOrder(division.id, nextRunner.id, 0);

      // Assert
      expect(callback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });

    it("참가자 이벤트(ParticipantEvent)가 발생하면 콜백을 호출한다.", async () => {
      // Arrange
      const callback = jest.fn();
      let participantEventCallback: ParticipantEventCallback | undefined;
      mockParticipantService.subscribeParticipantEvent.mockImplementation(
        (id, cb) => {
          participantEventCallback = cb;
          return () => {};
        }
      );

      // Act
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        callback
      );
      if (participantEventCallback) {
        // 참가자 이벤트 발생 시뮬레이션
        await participantEventCallback({
          type: "updated",
          participant: { ...runner, name: "Updated Name" },
        });
      }

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe();
    });

    it("대회 부문 이벤트(DivisionEvent)가 발생하면 콜백을 호출한다.", async () => {
      // Arrange
      const callback = jest.fn();
      let divisionEventCallback: DivisionEventCallback | undefined;
      mockCompetitionService.subscribeDivisionEvent.mockImplementation(
        (id, cb) => {
          divisionEventCallback = cb;
          return () => {};
        }
      );

      // Act
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        callback
      );
      if (divisionEventCallback) {
        // 대회 부문 이벤트 발생 시뮬레이션
        await divisionEventCallback({
          type: "updated",
          division,
        });
      }

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe();
    });

    it("구독 해제 시 모든 이벤트 구독이 해제된다.", async () => {
      // Arrange
      const unsubscribeDivisionEvent = jest.fn();
      const unsubscribeParticipantEvent = jest.fn();
      mockCompetitionService.subscribeDivisionEvent.mockReturnValue(
        unsubscribeDivisionEvent
      );
      mockParticipantService.subscribeParticipantEvent.mockReturnValue(
        unsubscribeParticipantEvent
      );

      // Act
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        jest.fn()
      );
      unsubscribe();

      // Assert
      expect(unsubscribeDivisionEvent).toHaveBeenCalledTimes(1);
      expect(unsubscribeParticipantEvent).toHaveBeenCalledTimes(1);
    });

    it("콜백에서 예외가 발생해도 서비스 로직은 계속 동작한다.", async () => {
      // Arrange
      const errorCallback = jest
        .fn()
        .mockRejectedValue(
          new Error("에러가 발생해도 정상적으로 동작해야 해요.")
        );
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const unsubscribe = await service.subscribeDivisionProgress(
        division.id,
        errorCallback
      );

      // Act
      const asyncTask = service.setRunner(division.id, runner.id);

      // Assert
      await expect(asyncTask).resolves.not.toThrow();

      // Cleanup
      consoleSpy.mockRestore();
      unsubscribe();
    });
  });
});
