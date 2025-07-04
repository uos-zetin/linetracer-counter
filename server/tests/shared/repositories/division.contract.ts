import { Division } from "@/core/models";
import { DivisionRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

function createEntity(index: number, competitionId?: string): Division {
  return {
    id: `test-${uuidv4()}`,
    competitionId: competitionId || `test-${uuidv4()}`,
    name: `부문 ${index + 1}`,
    description: `피할 수 없으면 즐겨요.`,
    createdAt: new Date(),
    status: "ready",
    stopwatchId: index % 2 === 0 ? `test-${uuidv4()}` : null,
  };
}

export function runDivisionRepositoryContract(
  name: string,
  make: () => Promise<DivisionRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: DivisionRepository;

    beforeAll(async () => {
      repo = await make();
    });

    it("대회 부문 엔티티를 저장하고 불러올 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(original);
    });

    it("특정 대회에 대한 대회 부문 엔티티를 여러 개 저장하고 불러올 수 있다.", async () => {
      const competitionId = `test-${uuidv4()}`;
      const original: Division[] = [];
      for (let i = 0; i < 5; i++) {
        original.push(createEntity(i, competitionId));
      }
      await Promise.all(original.map((d) => repo.create(d)));
      const loaded = await repo.getByCompetitionId(competitionId);

      expect(loaded).toHaveLength(original.length);
      expect(loaded).toEqual(expect.arrayContaining(original));
    });

    it("대회 부문 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const updated: Division = {
        ...original,
        name: "시니어 부문",
        description:
          "화가 날 때는 100까지 세어요. 최악일 때는 욕설을 퍼부어요.",
        status: "ongoing",
      };
      await repo.update(updated);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(updated);
    });

    it("대회 부문 엔티티를 삭제할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      await repo.delete(original.id);

      await expect(repo.getById(original.id)).rejects.toThrow(
        EntityNotFoundError
      );
    });

    it("존재하지 않는 대회 부문 엔티티를 불러오면 오류가 발생한다.", async () => {
      const id = `test-${uuidv4()}`;

      await expect(repo.getById(id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 대회 부문 엔티티를 수정하면 오류가 발생한다.", async () => {
      const updated = createEntity(0);

      await expect(repo.update(updated)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 대회 부문 엔티티를 삭제하면 오류가 발생한다.", async () => {
      const id = `test-${uuidv4()}`;

      await expect(repo.delete(id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 대회 부문의 엔티티를 조회하면 빈 배열을 반환한다.", async () => {
      const competitionId = `test-${uuidv4()}`;
      const divisions = await repo.getByCompetitionId(competitionId);

      expect(divisions).toHaveLength(0);
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });
  });
}
