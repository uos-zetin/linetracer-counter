import { TimerLogSQLiteRepository } from "@/infrastructure/repositories/timer-log-sqlite";
import { runTimerLogRepositoryContract } from "@tests/shared/repositories/timer-log.contract";

import sqlite3 from "sqlite3";

runTimerLogRepositoryContract(
  //
  "TimerLogSQLiteRepository 통합 테스트",
  async () => {
    const db = new sqlite3.Database(":memory:");
    const repo = new TimerLogSQLiteRepository(db);
    return await repo.initialize();
  }
);
