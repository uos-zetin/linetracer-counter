import { Record } from "@/core/models";
import { RecordRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

export function runRecordRepositoryContract(
  name: string,
  make: () => Promise<RecordRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: RecordRepository;

    beforeAll(async () => {
      repo = await make();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    function createEntity(participantId?: string): Record {
      return {
        id: `test-${uuidv4()}`,
        participantId: participantId ?? `test-${uuidv4()}`,
        value: Math.floor(Math.random() * 10000),
        source: "stopwatch" as const,
        status: "pending" as const,
        note: "여기는 비고란",
        createdAt: new Date(),
      };
    }

    it("기록 엔티티를 저장하고 불러올 수 있다.", async () => {
      const entity = createEntity();
      await repo.create(entity);
      const loaded = await repo.getById(entity.id);

      expect(loaded).toEqual(entity);
    });

    it("특정 참가자에 대해 여러 기록들을 저장하고 불러올 수 있다.", async () => {
      const participantId = `test-${uuidv4()}`;
      const entities: Record[] = [];
      for (let i = 0; i < 5; i++) {
        entities.push(createEntity(participantId));
      }
      await Promise.all(entities.map((c) => repo.create(c)));
      const loaded = await repo.getByParticipantId(participantId);

      expect(loaded).toHaveLength(entities.length);
      for (const entity of entities) {
        expect(loaded).toContainEqual(entity);
      }
    });

    it("기록 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity();
      await repo.create(original);
      const updated: Record = {
        ...original,
        value: 100000,
        source: "manual" as const,
        status: "approved" as const,
        note: "수정된 기록 비고",
      };
      await repo.update(updated);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(updated);
    });

    it("기록 엔티티를 삭제할 수 있고, 해당 엔티티에 접근할 수 없다.", async () => {
      const entity = createEntity();
      await repo.create(entity);
      await repo.delete(entity.id);
      const loaded = await repo.getByParticipantId(entity.participantId);

      expect(loaded).not.toContainEqual(entity);
      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 기록 엔티티에 접근하면 오류가 발생한다.", async () => {
      const entity = createEntity();

      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("특정 참가자의 기록들이 생성 시간 순서대로 정렬되어 반환된다.", async () => {
      const participantId = `test-${uuidv4()}`;
      const entities: Record[] = [];
      const now = new Date();
      for (let factor of [0, 3, 2, 1]) {
        const entity = createEntity(participantId);
        entity.createdAt = new Date(now.getTime() + factor * 1000);
        entities.push(entity);
      }
      await Promise.all(entities.map((c) => repo.create(c)));
      const loaded = await repo.getByParticipantId(participantId);

      // createdAt 순서대로 정렬되어야 함
      const sortedEntities = [...entities].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      expect(loaded.map((c) => c.id)).toEqual(sortedEntities.map((c) => c.id));
    });
  });
}
