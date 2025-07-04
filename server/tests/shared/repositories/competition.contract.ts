import { Competition } from "@/core/models";
import { CompetitionRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

function createEntity(index: number): Competition {
  return {
    id: `test-${uuidv4()}`,
    name: `제${index + 1}회 멍 때리기 대회`,
    description: "멍 때리기는 뇌를 쉬게 한대요.",
    createdAt: new Date(),
  };
}

export function runCompetitionRepositoryContract(
  name: string,
  make: () => Promise<CompetitionRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: CompetitionRepository;

    beforeAll(async () => {
      repo = await make();
    });

    it("대회 엔티티를 저장하고 불러올 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(original);
    });

    it("대회 엔티티를 여러 개 저장하고 불러올 수 있다.", async () => {
      const original: Competition[] = [];
      for (let i = 0; i < 5; i++) {
        original.push(createEntity(i));
      }
      await Promise.all(original.map((c) => repo.create(c)));
      const loaded = await repo.getAll();

      expect(loaded).toEqual(expect.arrayContaining(original));
    });

    it("대회 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const updated: Competition = {
        ...original,
        name: "제2회 멍 때리기 대회",
        description: "멍 때리기는 스트레스 해소에 좋대요.",
      };
      await repo.update(updated);
      const loaded = await repo.getById(updated.id);

      expect(loaded).toEqual(updated);
    });

    it("대회 엔티티를 삭제할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      await repo.delete(original.id);

      await expect(repo.getById(original.id)).rejects.toThrow(
        EntityNotFoundError
      );
    });

    it("존재하지 않는 대회 엔티티를 불러오면 오류가 발생한다.", async () => {
      const id = `test-${uuidv4()}`;

      await expect(repo.getById(id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 대회 엔티티를 수정하면 오류가 발생한다.", async () => {
      const updated = createEntity(0);

      await expect(repo.update(updated)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 대회 엔티티를 삭제하면 오류가 발생한다.", async () => {
      const id = `test-${uuidv4()}`;

      await expect(repo.delete(id)).rejects.toThrow(EntityNotFoundError);
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });
  });
}
