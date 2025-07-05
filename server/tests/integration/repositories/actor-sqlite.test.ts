import { ActorSQLiteRepository } from "@/repositories/actor-sqlite";
import { runActorRepositoryContract } from "@tests/shared/repositories/actor.contract";

import sqlite3 from "sqlite3";

runActorRepositoryContract(
  //
  "ActorSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new ActorSQLiteRepository(db);
    return await repo.initialize();
  }
);
