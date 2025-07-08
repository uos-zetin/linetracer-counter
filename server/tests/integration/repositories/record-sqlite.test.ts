import { RecordSQLiteRepository } from "@/repositories/record-sqlite";
import { runRecordRepositoryContract } from "@tests/shared/repositories/record.contract";

import sqlite3 from "sqlite3";

runRecordRepositoryContract(
  //
  "RecordSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new RecordSQLiteRepository(db);
    return await repo.initialize();
  }
);
