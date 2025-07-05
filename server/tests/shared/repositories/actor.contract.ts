import { Actor } from "@/core/models";
import { ActorRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

export function runActorRepositoryContract(
  name: string,
  make: () => Promise<ActorRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: ActorRepository;

    beforeAll(async () => {
      repo = await make();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    function createEntity(index: number, roles: Actor["roles"] = []): Actor {
      return {
        id: `test-${uuidv4()}`,
        name: `사용자 ${index + 1}`,
        roles,
        createdAt: new Date(),
      };
    }

    it("액터 엔티티를 저장하고 불러올 수 있다.", async () => {
      const entity = createEntity(0, ["administrator", "manualRecorder"]);
      await repo.create(entity);
      const loaded = await repo.getById(entity.id);

      expect(loaded).toEqual(entity);
    });

    it("액터 엔티티를 여러 개 저장하고 불러올 수 있다.", async () => {
      const entities: Actor[] = [];
      for (let i = 0; i < 5; i++) {
        entities.push(createEntity(i));
      }
      await Promise.all(entities.map((a) => repo.create(a)));
      const loaded = await repo.getAll();

      expect(loaded).toEqual(expect.arrayContaining(entities));
    });

    it("액터 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const updated: Actor = {
        ...original,
        name: "수정된 사용자",
        roles: ["stopwatchRecorder"],
      };
      await repo.update(updated);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(updated);
    });

    it("액터 엔티티를 삭제할 수 있고, 해당 엔티티에 접근할 수 없다.", async () => {
      const entity = createEntity(0);
      await repo.create(entity);
      await repo.delete(entity.id);
      const loaded = await repo.getAll();

      expect(loaded).not.toContainEqual(entity);
      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 액터 엔티티에 접근하면 오류가 발생한다.", async () => {
      const entity = createEntity(0);

      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });
  });
}
