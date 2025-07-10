import { TimerLog } from "@/core/models";
import { TimerLogRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

export function runTimerLogRepositoryContract(
  name: string,
  make: () => Promise<TimerLogRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: TimerLogRepository;

    beforeAll(async () => {
      repo = await make();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    const logTypes: TimerLog["type"][] = ["start", "stop", "adjust"];

    function createEntity(order: number, participantId?: string): TimerLog {
      const logType = logTypes[order % logTypes.length];
      let value = Date.now();
      if (logType === "stop") {
        value = Date.now() + 10000; // 10초 뒤
      } else if (logType === "adjust") {
        value = order % 2 === 0 ? 3000 : -1000; // 3초 추가 또는 1초 차감
      }

      return {
        id: `test-${uuidv4()}`,
        participantId: participantId ?? `test-${uuidv4()}`,
        value,
        type: logType,
        createdAt: new Date(),
      };
    }

    it("타이머 로그 엔티티를 저장하고 불러올 수 있다.", async () => {
      const entity = createEntity(0);
      await repo.create(entity);
      const loaded = await repo.getById(entity.id);

      expect(loaded).toEqual(entity);
    });

    it("특정 참가자에 대해 여러 타이머 로그들을 저장하고 불러올 수 있다.", async () => {
      const participantId = `test-${uuidv4()}`;
      const entities: TimerLog[] = [];
      for (let i = 0; i < 5; i++) {
        entities.push(createEntity(i, participantId));
      }
      await Promise.all(entities.map((c) => repo.create(c)));
      const loaded = await repo.getByParticipantId(participantId);

      expect(loaded).toHaveLength(entities.length);
      for (const entity of entities) {
        expect(loaded).toContainEqual(entity);
      }
    });

    it("타이머 로그 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(0);
      await repo.create(original);
      const updated: TimerLog = {
        ...original,
        value: 2000,
        type: "adjust",
      };
      await repo.update(updated);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(updated);
    });

    it("타이머 로그 엔티티를 삭제할 수 있고, 해당 엔티티에 접근할 수 없다.", async () => {
      const entity = createEntity(0);
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

    it("존재하지 않는 타이머 로그 엔티티에 접근하면 오류가 발생한다.", async () => {
      const entity = createEntity(0);

      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("특정 참가자의 타이머 로그들이 생성 시각 순서대로 정렬되어 반환된다.", async () => {
      const participantId = `test-${uuidv4()}`;
      const entities: TimerLog[] = [];
      const now = new Date();
      for (let factor of [0, 2, 3, 1]) {
        const entity = createEntity(factor, participantId);
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
