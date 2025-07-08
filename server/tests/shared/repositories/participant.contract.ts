import { Participant } from "@/core/models";
import { ParticipantRepository } from "@/core/repositories";
import { EntityNotFoundError } from "@/core/errors";

import { v4 as uuidv4 } from "uuid";

export function runParticipantRepositoryContract(
  name: string,
  make: () => Promise<ParticipantRepository>,
  cleanup?: () => Promise<void>
) {
  describe(name, () => {
    let repo: ParticipantRepository;

    beforeAll(async () => {
      repo = await make();
    });

    afterAll(async () => {
      if (cleanup) {
        await cleanup();
      }
    });

    function createEntity(order: number, divisionId?: string): Participant {
      return {
        id: `test-${uuidv4()}`,
        divisionId: divisionId ?? `test-${uuidv4()}`,
        name: `테스트 참가자 ${order}`,
        teamName: `테스트 팀 ${order}`,
        robotName: `테스트 로봇 ${order}`,
        comment: `테스트 참가자 ${order}의 코멘트`,
        orderRaw: order,
        givenTime: 4 * 60 * 1000, // 4분
        createdAt: new Date(),
      };
    }

    it("참가자 엔티티를 저장하고 불러올 수 있다.", async () => {
      const entity = createEntity(1);
      await repo.create(entity);
      const loaded = await repo.getById(entity.id);

      expect(loaded).toEqual(entity);
    });

    it("특정 부문에 대해 여러 참가자들을 저장하고 불러올 수 있다.", async () => {
      const divisionId = `test-${uuidv4()}`;
      const entities: Participant[] = [];
      for (let i = 0; i < 5; i++) {
        entities.push(createEntity(i, divisionId));
      }
      await Promise.all(entities.map((c) => repo.create(c)));
      const loaded = await repo.getByDivisionId(divisionId);

      expect(loaded).toHaveLength(entities.length);
      expect(loaded).toEqual(entities);
    });

    it("참가자 엔티티를 수정할 수 있다.", async () => {
      const original = createEntity(1);
      await repo.create(original);
      const updated: Participant = {
        ...original,
        name: "수정된 참가자 이름",
        teamName: "수정된 팀 이름",
        robotName: "수정된 로봇 이름",
        comment: "수정된 참가자 코멘트",
        orderRaw: 999,
        givenTime: 5 * 60 * 1000, // 5분
      };
      await repo.update(updated);
      const loaded = await repo.getById(original.id);

      expect(loaded).toEqual(updated);
    });

    it("참가자 엔티티를 삭제할 수 있고, 해당 엔티티에 접근할 수 없다.", async () => {
      const entity = createEntity(1);
      await repo.create(entity);
      await repo.delete(entity.id);
      const loaded = await repo.getByDivisionId(entity.divisionId);

      expect(loaded).not.toContainEqual(entity);
      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("존재하지 않는 참가자 엔티티에 접근하면 오류가 발생한다.", async () => {
      const entity = createEntity(1);

      await expect(repo.getById(entity.id)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(repo.update(entity)).rejects.toThrow(EntityNotFoundError);
      await expect(repo.delete(entity.id)).rejects.toThrow(EntityNotFoundError);
    });

    it("특정 부문의 참가자들이 경연 순서대로 정렬되어 반환된다.", async () => {
      const orders = [4, 1, 3, 2];
      const divisionId = `test-${uuidv4()}`;
      const entities = orders.map((order) => createEntity(order, divisionId));
      await Promise.all(entities.map((c) => repo.create(c)));
      const loaded = await repo.getByDivisionId(divisionId);

      // orderRaw 순서대로 정렬되어야 함
      const targetOrders = [...orders].sort((a, b) => a - b);
      expect(loaded.map((c) => c.orderRaw)).toEqual(targetOrders);
    });
  });
}
