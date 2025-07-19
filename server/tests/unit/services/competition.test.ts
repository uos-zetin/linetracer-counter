import { Competition, Division, Participant, Record } from "@/core/models";
import {
  CompetitionRepository,
  DivisionRepository,
  ParticipantRepository,
  RecordRepository,
} from "@/core/repositories";
import { CompetitionService } from "@/core/services/competition";

import { v4 as uuidv4 } from "uuid";

const mockCompetitionRepo: jest.Mocked<CompetitionRepository> = {
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockDivisionRepo: jest.Mocked<DivisionRepository> = {
  getByCompetitionId: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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

const generateDummyCompetitions = (count: number): Competition[] => {
  const dummies: Competition[] = [];
  for (let i = 0; i < count; i++) {
    dummies.push({
      id: uuidv4(),
      name: `제${i + 1}회 멍때리기 대회`,
      description: "멍때리기는 정신을 맑게 해줘요.",
      createdAt: new Date(),
    });
  }
  return dummies;
};

const generateDummyDivisions = (
  count: number,
  competitionId: string
): Division[] => {
  const dummies: Division[] = [];
  for (let i = 0; i < count; i++) {
    dummies.push({
      id: uuidv4(),
      competitionId,
      name: `부문 ${i + 1}`,
      description: `제${i + 1}회 부문 설명`,
      createdAt: new Date(),
      status: "ready",
    });
  }
  return dummies;
};

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

describe("CompetitionService 단위 테스트", () => {
  let service: CompetitionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompetitionService({
      competitionRepository: mockCompetitionRepo,
      divisionRepository: mockDivisionRepo,
      participantRepository: mockParticipantRepo,
      recordRepository: mockRecordRepo,
    });
  });

  it("대회 목록을 조회할 수 있다.", async () => {
    // Arrange
    const competitions = generateDummyCompetitions(5);
    mockCompetitionRepo.getAll.mockResolvedValue(competitions);

    // Act
    const result = await service.getCompetitions();

    // Assert
    expect(result).toEqual(competitions);
    expect(mockCompetitionRepo.getAll).toHaveBeenCalledTimes(1);
  });

  it("특정 대회를 조회할 수 있다.", async () => {
    // Arrange
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);

    // Act
    const result = await service.getCompetition(competition.id);

    // Assert
    expect(result).toEqual(competition);
    expect(mockCompetitionRepo.getById).toHaveBeenCalledWith(competition.id);
  });

  it("특정 대회의 부문들을 조회할 수 있다.", async () => {
    // Arrange
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);
    const divisions = generateDummyDivisions(3, competition.id);
    mockDivisionRepo.getByCompetitionId.mockResolvedValue(divisions);

    // Act
    const result = await service.getCompetitionWithDivisions(competition.id);

    // Assert
    expect(result).toEqual({
      competition: competition,
      divisions: divisions,
    });
    expect(mockCompetitionRepo.getById).toHaveBeenCalledWith(competition.id);
    expect(mockDivisionRepo.getByCompetitionId).toHaveBeenCalledWith(
      competition.id
    );
  });

  it("대회를 생성할 수 있다.", async () => {
    // Arrange
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.create.mockResolvedValue(competition);

    // Act
    const result = await service.createCompetition(
      competition.name,
      competition.description
    );

    // Assert
    expect(result).toEqual(competition);
    expect(mockCompetitionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: competition.name,
        description: competition.description,
      })
    );
  });

  it("특정 대회 정보를 수정할 수 있다.", async () => {
    // Arrange
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);
    const data = {
      name: "수정된 대회 이름",
      description: "수정된 대회 설명",
    };
    const updatedCompetition: Competition = { ...competition, ...data };
    mockCompetitionRepo.update.mockResolvedValue(updatedCompetition);

    // Act
    const result = await service.updateCompetition(competition.id, data);

    // Assert
    expect(result).toEqual(updatedCompetition);
    expect(mockCompetitionRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: data.name,
        description: data.description,
      })
    );
  });

  it("특정 대회를 삭제할 수 있다.", async () => {
    // Arrange
    mockCompetitionRepo.delete.mockResolvedValue();
    const competition = generateDummyCompetitions(1)[0];

    // Act
    await service.deleteCompetition(competition.id);

    // Assert
    expect(mockCompetitionRepo.delete).toHaveBeenCalledWith(competition.id);
  });

  it("대회 부문을 생성할 수 있다.", async () => {
    // Arrange
    const competitionId = uuidv4();
    const division = generateDummyDivisions(1, competitionId)[0];
    mockDivisionRepo.create.mockResolvedValue(division);

    // Act
    const result = await service.createDivision(
      division.competitionId,
      division.name,
      division.description
    );

    // Assert
    expect(result).toEqual(division);
    expect(mockDivisionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        competitionId: division.competitionId,
        name: division.name,
        description: division.description,
      })
    );
  });

  it("특정 대회 부문을 수정할 수 있다.", async () => {
    // Arrange
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    const data = {
      name: "수정된 부문 이름",
      description: "수정된 부문 설명",
    };
    const updatedDivision: Division = { ...division, ...data };
    mockDivisionRepo.update.mockResolvedValue(updatedDivision);

    // Act
    const result = await service.updateDivision(division.id, data);

    // Assert
    expect(result).toEqual(updatedDivision);
    expect(mockDivisionRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: data.name,
        description: data.description,
      })
    );
  });

  it("특정 대회 부문의 상태를 설정할 수 있다.", async () => {
    // Arrange
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    const updatedDivision: Division = {
      ...division,
      status: "ongoing",
    };
    mockDivisionRepo.update.mockResolvedValue(updatedDivision);

    // Act
    const result = await service.setDivisionStatus(division.id, "ongoing");

    // Assert
    expect(result).toEqual(updatedDivision);
    expect(mockDivisionRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ongoing",
      })
    );
  });

  it("특정 대회 부문을 삭제할 수 있다.", async () => {
    // Arrange
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    mockDivisionRepo.delete.mockResolvedValue();

    // Act
    await service.deleteDivision(division.id);

    // Assert
    expect(mockDivisionRepo.delete).toHaveBeenCalledWith(division.id);
  });

  it("특정 부문의 상위 기록을 조회할 수 있다.", async () => {
    // Arrange
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

    // Act
    const result = await service.getTopRecordsByDivision(divisionId);

    // Assert
    expect(result.map((r) => [r.participantId, r.value])).toEqual([
      [mockParticipants[1].id, 1000],
      [mockParticipants[0].id, 3000],
    ]);
  });

  describe("특정 대회 부문 이벤트 구독 테스트", () => {
    let division: Division;
    let callback1: jest.Mock;
    let callback2: jest.Mock;
    let callback1Unsubscriber: () => void;
    let callback2Unsubscriber: () => void;

    beforeEach(() => {
      // Arrange
      division = generateDummyDivisions(1, uuidv4())[0];
      callback1 = jest.fn();
      callback2 = jest.fn();
      callback1Unsubscriber = service.subscribeDivisionEvent(
        division.id,
        callback1
      );
      callback2Unsubscriber = service.subscribeDivisionEvent(
        division.id,
        callback2
      );
    });

    afterEach(() => {
      callback1Unsubscriber();
      callback2Unsubscriber();
      jest.clearAllMocks();
    });

    it("대회 부문 상태가 설정됐을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      mockDivisionRepo.getById.mockResolvedValue(division);
      const updatedDivision: Division = {
        ...division,
        status: "ongoing",
      };
      mockDivisionRepo.update.mockResolvedValue(updatedDivision);

      // Act
      await service.setDivisionStatus(division.id, "ongoing");

      // Assert
      expect(callback1).toHaveBeenCalledWith({
        type: "status-changed",
        division: updatedDivision,
      });
      expect(callback2).toHaveBeenCalledWith({
        type: "status-changed",
        division: updatedDivision,
      });
    });

    it("대회 부문 정보가 변경되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      mockDivisionRepo.getById.mockResolvedValue(division);
      const data = {
        name: "수정된 부문 이름",
        description: "수정된 부문 설명",
      };
      const updatedDivision: Division = { ...division, ...data };
      mockDivisionRepo.update.mockResolvedValue(updatedDivision);

      // Act
      await service.updateDivision(division.id, data);

      // Assert
      expect(callback1).toHaveBeenCalledWith({
        type: "updated",
        division: updatedDivision,
      });
      expect(callback2).toHaveBeenCalledWith({
        type: "updated",
        division: updatedDivision,
      });
    });

    it("대회 부문이 삭제되었을 때 모든 구독자에게 알림을 보낸다.", async () => {
      // Arrange
      mockDivisionRepo.delete.mockResolvedValue();

      // Act
      await service.deleteDivision(division.id);

      // Assert
      expect(callback1).toHaveBeenCalledWith({
        type: "deleted",
      });
      expect(callback2).toHaveBeenCalledWith({
        type: "deleted",
      });
    });

    it("구독 함수에서 오류가 발생해도 서비스 로직은 정상적으로 동작한다.", async () => {
      // Arrange
      const errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      callback1.mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
      mockDivisionRepo.delete.mockResolvedValue();

      // Act
      await service.deleteDivision(division.id);

      // Assert
      expect(callback1).toHaveBeenCalledWith({
        type: "deleted",
      });
      expect(callback2).toHaveBeenCalledWith({
        type: "deleted",
      });

      // Clean up
      errorSpy.mockRestore();
    });

    it("구독을 해제하면 더 이상 이벤트를 받지 않는다.", async () => {
      // Arrange
      mockDivisionRepo.delete.mockResolvedValue();
      callback1Unsubscriber();

      // Act
      await service.deleteDivision(division.id);

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith({
        type: "deleted",
      });
    });
  });
});
