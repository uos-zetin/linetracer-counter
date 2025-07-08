import { ParticipantSQLiteRepository } from "@/repositories/participant-sqlite";
import { runParticipantRepositoryContract } from "@tests/shared/repositories/participant.contract";

import sqlite3 from "sqlite3";

runParticipantRepositoryContract(
  //
  "ParticipantSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new ParticipantSQLiteRepository(db);
    return await repo.initialize();
  }
);
