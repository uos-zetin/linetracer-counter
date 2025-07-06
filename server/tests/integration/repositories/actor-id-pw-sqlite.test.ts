import { ActorIdPwSQLiteRepository } from "@/repositories/actor-id-pw-sqlite";
import { runActorIdPwRepositoryContract } from "@tests/shared/repositories/actor-id-pw.contract";

import sqlite3 from "sqlite3";

runActorIdPwRepositoryContract(
  //
  "ActorIdPwSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new ActorIdPwSQLiteRepository(db);
    return await repo.initialize();
  }
);
