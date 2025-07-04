import { DivisionSQLiteRepository } from "@/repositories/division-sqlite";
import { runDivisionRepositoryContract } from "@tests/shared/repositories/division.contract";

import sqlite3 from "sqlite3";

runDivisionRepositoryContract(
  //
  "DivisionSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new DivisionSQLiteRepository(db);
    return await repo.initialize();
  }
);
