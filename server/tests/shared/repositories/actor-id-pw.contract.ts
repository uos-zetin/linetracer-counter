import { ActorIdPw } from "@/core/models";
import { ActorIdPwRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

export function runActorIdPwRepositoryContract(
  name: string,
  make: () => Promise<ActorIdPwRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: ActorIdPwRepository;

    beforeAll(async () => {
      repo = await make();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    function createEntity(index: number): ActorIdPw {
      return {
        id: `test-${uuidv4()}`,
        username: `익명의 너구리 ${uuidv4()}`,
        actorId: `test-${uuidv4()}`,
        hashedPassword: `hashedPassword-${uuidv4()}`,
        createdAt: new Date(),
      };
    }

    it("액터 ID/PW 엔티티를 저장하고 불러올 수 있다.", async () => {
      const entity = createEntity(0);
      await repo.create(entity);
      const loadedByUsername = await repo.getByUsername(entity.username);
      const loadedByActorId = await repo.getByActorId(entity.actorId);

      expect(loadedByUsername).toEqual(entity);
      expect(loadedByActorId).toEqual(entity);
    });

    it("액터 ID/PW 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const updated: ActorIdPw = {
        ...original,
        hashedPassword: "updated-hashed-password",
      };
      await repo.update(updated);
      const loaded = await repo.getByUsername(original.username);

      expect(loaded).toEqual(updated);
    });

    it("액터 ID/PW 엔티티를 삭제할 수 있고, 해당 엔티티에 접근할 수 없다.", async () => {
      const entity = createEntity(0);
      await repo.create(entity);
      await repo.delete(entity.id);

      await expect(repo.getByUsername(entity.username)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 액터 ID/PW 엔티티에 접근하면 오류가 발생한다.", async () => {
      const entity = createEntity(0);

      await expect(repo.getByUsername(entity.username)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });
  });
}
