import { ManualRecordSQLiteRepository } from "@/infrastructure/repositories/manual-record-sqlite";
import { runManualRecordRepositoryContract } from "@tests/shared/repositories/manual-record.contract";

import sqlite3 from "sqlite3";

runManualRecordRepositoryContract(
  //
  "ManualRecordSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new ManualRecordSQLiteRepository(db);
    return await repo.initialize();
  }
);
