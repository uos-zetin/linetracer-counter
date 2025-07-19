import { Participant } from "@/core/models";
import { ParticipantRepository } from "@/core/repositories";
import { ParticipantService } from "@/core/services/participant";

import { v4 as uuidv4 } from "uuid";

const mockParticipantRepo: jest.Mocked<ParticipantRepository> = {
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByDivisionId: jest.fn(),
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
});
