import { CompetitionSQLiteRepository } from "@/repositories/competition-sqlite";
import { runCompetitionRepositoryContract } from "@tests/shared/repositories/competition.contract";

import sqlite3 from "sqlite3";

runCompetitionRepositoryContract(
  //
  "CompetitionSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new CompetitionSQLiteRepository(db);
    return await repo.initialize();
  }
);
