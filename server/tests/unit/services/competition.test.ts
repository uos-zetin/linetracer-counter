import { AuthorizationError } from "@/core/errors";
import { Actor, Competition, Division } from "@/core/models";
import { CompetitionRepository, DivisionRepository } from "@/core/repositories";

import { CompetitionServiceImpl } from "@/core/services/competition";

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

describe("CompetitionService 구현체 단위 테스트", () => {
  let service: CompetitionServiceImpl;
  let adminActor: Actor;
  let anonymousActor: Actor;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    adminActor = {
      id: uuidv4(),
      name: "김태환",
      roles: ["administrator"],
      createdAt: new Date(),
    };
    anonymousActor = {
      id: uuidv4(),
      name: "익명의 러블리",
      roles: [],
      createdAt: new Date(),
    };
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompetitionServiceImpl({
      competitionRepository: mockCompetitionRepo,
      divisionRepository: mockDivisionRepo,
    });
  });

  it("아무나 대회 목록을 조회할 수 있다.", async () => {
    const competitions = generateDummyCompetitions(5);
    mockCompetitionRepo.getAll.mockResolvedValue(competitions);

    await expect(service.getCompetitions(anonymousActor)).resolves.toEqual(
      competitions
    );
  });

  it("아무나 특정 대회의 부문들을 조회할 수 있다.", async () => {
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);
    const divisions = generateDummyDivisions(3, competition.id);
    mockDivisionRepo.getByCompetitionId.mockResolvedValue(divisions);

    await expect(
      service.getCompetitionWithDivisions(anonymousActor, competition.id)
    ).resolves.toEqual({
      competition: competition,
      divisions: divisions,
    });
  });

  it("관리자만 대회를 생성할 수 있다.", async () => {
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.create.mockResolvedValue(competition);

    await expect(
      service.createCompetition(
        anonymousActor,
        competition.name,
        competition.description
      )
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.createCompetition(
        adminActor,
        competition.name,
        competition.description
      )
    ).resolves.toEqual(competition);
    expect(mockCompetitionRepo.create).toHaveBeenCalledTimes(1);
  });

  it("관리자만 대회 정보를 수정할 수 있다.", async () => {
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);
    const data = {
      name: "수정된 대회 이름",
      description: "수정된 대회 설명",
    };
    const updatedCompetition: Competition = {
      ...competition,
      ...data,
    };
    mockCompetitionRepo.update.mockResolvedValue(updatedCompetition);

    await expect(
      service.updateCompetition(anonymousActor, competition.id, data)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.updateCompetition(adminActor, competition.id, data)
    ).resolves.toEqual(updatedCompetition);
    expect(mockCompetitionRepo.update).toHaveBeenCalledTimes(1);
  });

  it("관리자만 대회를 삭제할 수 있다.", async () => {
    mockCompetitionRepo.delete.mockResolvedValue();
    const competition = generateDummyCompetitions(1)[0];

    await expect(
      service.deleteCompetition(anonymousActor, competition.id)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.deleteCompetition(adminActor, competition.id)
    ).resolves.toBeUndefined();
    expect(mockCompetitionRepo.delete).toHaveBeenCalledTimes(1);
  });

  it("관리자만 특정 대회 부문을 생성할 수 있다.", async () => {
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.create.mockResolvedValue(division);

    await expect(
      service.createDivision(
        anonymousActor,
        division.competitionId,
        division.name,
        division.description
      )
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.createDivision(
        adminActor,
        division.competitionId,
        division.name,
        division.description
      )
    ).resolves.toEqual(division);
    expect(mockDivisionRepo.create).toHaveBeenCalledTimes(1);
  });

  it("관리자만 특정 대회 부문을 수정할 수 있다.", async () => {
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    const data = {
      name: "수정된 부문 이름",
      description: "수정된 부문 설명",
    };
    const updatedDivision: Division = {
      ...division,
      ...data,
    };
    mockDivisionRepo.update.mockResolvedValue(updatedDivision);

    await expect(
      service.updateDivision(anonymousActor, division.id, data)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.updateDivision(adminActor, division.id, data)
    ).resolves.toEqual(updatedDivision);
    expect(mockDivisionRepo.update).toHaveBeenCalledTimes(1);
  });

  it("관리자만 특정 대회 부문의 상태를 설정할 수 있다.", async () => {
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    const updatedDivision: Division = {
      ...division,
      status: "ongoing",
    };
    mockDivisionRepo.update.mockResolvedValue(updatedDivision);

    await expect(
      service.setDivisionStatus(anonymousActor, division.id, "ongoing")
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.setDivisionStatus(adminActor, division.id, "ongoing")
    ).resolves.toEqual(updatedDivision);
    expect(mockDivisionRepo.update).toHaveBeenCalledTimes(1);
  });

  it("관리자만 특정 대회 부문을 삭제할 수 있다.", async () => {
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);
    mockDivisionRepo.delete.mockResolvedValue();

    await expect(
      service.deleteDivision(anonymousActor, division.id)
    ).rejects.toThrow(AuthorizationError);
    await expect(
      service.deleteDivision(adminActor, division.id)
    ).resolves.toBeUndefined();
    expect(mockDivisionRepo.delete).toHaveBeenCalledTimes(1);
  });

  it("대회가 갱신되었을 때 구독자에게 알림을 보낸다.", async () => {
    const competition = generateDummyCompetitions(1)[0];
    mockCompetitionRepo.getById.mockResolvedValue(competition);

    const callback1 = jest.fn();
    const unsubscriber1 = service.subscribeCompetitionUpdated(
      competition.id,
      callback1
    );
    const callback2 = jest
      .fn()
      .mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
    const unsubscriber2 = service.subscribeCompetitionUpdated(
      competition.id,
      callback2
    );

    /**
     * 대회를 갱신할 때 이벤트가 발생하는지 확인한다.
     */
    const target = {
      name: "수정된 대회 이름",
      description: "수정된 대회 설명",
    };
    const updatedCompetition: Competition = {
      ...competition,
      ...target,
    };
    mockCompetitionRepo.update.mockResolvedValue(updatedCompetition);
    await service.updateCompetition(adminActor, competition.id, target);
    expect(callback1).toHaveBeenNthCalledWith(1, updatedCompetition);
    expect(callback2).toHaveBeenNthCalledWith(1, updatedCompetition);

    /**
     * 이벤트 리스너 제거가 잘 되는지 확인한다.
     */
    unsubscriber1();
    unsubscriber2();
    await service.updateCompetition(adminActor, competition.id, target);
    expect(callback1).toHaveBeenCalledTimes(1); // 호출 횟수가 그대로인지 확인
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("대회 부문이 갱신되었을 때 구독자에게 알림을 보낸다.", async () => {
    const division = generateDummyDivisions(1, uuidv4())[0];
    mockDivisionRepo.getById.mockResolvedValue(division);

    const callback1 = jest.fn();
    const unsubscriber1 = service.subscribeDivisionUpdated(
      division.id,
      callback1
    );
    const callback2 = jest
      .fn()
      .mockRejectedValue(
        new Error("에러가 발생해도 서비스 로직은 정상적으로 동작해야 해요.")
      );
    const unsubscriber2 = service.subscribeDivisionUpdated(
      division.id,
      callback2
    );

    /**
     * 1. 대회 부문을 갱신할 때 이벤트가 발생하는지 확인한다.
     */
    const targetName = "수정된 부문 이름";
    mockDivisionRepo.update.mockResolvedValue({
      ...division,
      name: targetName,
    });
    await service.updateDivision(adminActor, division.id, {
      name: targetName,
    });
    expect(callback1).toHaveBeenNthCalledWith(1, {
      ...division,
      name: targetName,
    });

    /**
     * 2. 대회 부문 상태를 설정할 때 이벤트가 발생하는지 확인한다.
     */
    const targetStatus: Division["status"] = "ongoing";
    mockDivisionRepo.update.mockResolvedValue({
      ...division,
      status: targetStatus,
    });
    await service.setDivisionStatus(adminActor, division.id, targetStatus);
    expect(callback2).toHaveBeenNthCalledWith(2, {
      ...division,
      status: targetStatus,
    });

    /**
     * 이벤트 리스너 제거가 잘 되는지 확인한다.
     */
    unsubscriber1();
    unsubscriber2();
    await service.updateDivision(adminActor, division.id, {
      name: targetName,
    });
    expect(callback1).toHaveBeenCalledTimes(2); // 호출 횟수가 그대로인지 확인
    expect(callback2).toHaveBeenCalledTimes(2);
  });
});
