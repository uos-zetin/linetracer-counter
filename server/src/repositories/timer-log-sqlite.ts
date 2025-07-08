import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { TimerLog } from "@/core/models";
import { TimerLogRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "@/utils/sqlite";
import sqlite3 from "sqlite3";

type TimerLogRecord = {
  id: string;
  participantId: string;
  value: number;
  logType: string;
  createdAt: string;
  isDeleted: number;
};

export class TimerLogSQLiteRepository implements TimerLogRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<TimerLogRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS timer_logs (
          id TEXT PRIMARY KEY NOT NULL,
          participantId TEXT NOT NULL,
          value INTEGER NOT NULL,
          logType TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      );
      await this.db.run(
        // index [participantId, createdAt] for efficient querying by participant
        `CREATE INDEX IF NOT EXISTS idx_timer_logs_participantId_createdAt
          ON timer_logs (participantId, createdAt)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize TimerLog database: ${err}`
      );
    }
    return this;
  }

  private recordToEntity(record: TimerLogRecord): TimerLog {
    return {
      id: record.id,
      participantId: record.participantId,
      value: record.value,
      type: record.logType as TimerLog["type"],
      createdAt: new Date(record.createdAt),
    };
  }

  async getById(id: string): Promise<TimerLog> {
    const row = await this.db
      .get<TimerLogRecord>(
        `SELECT * FROM timer_logs WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get timer log by id '${id}': ${err}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(`TimerLog with id '${id}' not found`);
    }
    return this.recordToEntity(row);
  }

  async create(timerLog: TimerLog): Promise<TimerLog> {
    await this.db
      .run(
        `INSERT INTO timer_logs (id, participantId, value, logType, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, ?, 0)`,
        [
          timerLog.id,
          timerLog.participantId,
          timerLog.value,
          timerLog.type,
          timerLog.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create TimerLog: ${err}`);
      });
    return timerLog;
  }

  async update(timerLog: TimerLog): Promise<TimerLog> {
    const result = await this.db
      .run(
        `UPDATE timer_logs
          SET participantId = ?, value = ?, logType = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          timerLog.participantId,
          timerLog.value,
          timerLog.type,
          timerLog.createdAt.toISOString(),
          timerLog.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update TimerLog: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `TimerLog with ID ${timerLog.id} not found`
      );
    }
    return timerLog;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(
        `UPDATE timer_logs SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete TimerLog: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`TimerLog with ID ${id} not found`);
    }
  }

  async getByParticipantId(participantId: string): Promise<TimerLog[]> {
    const rows = await this.db
      .all<TimerLogRecord>(
        `SELECT * FROM timer_logs
          WHERE participantId = ? AND isDeleted = 0
          ORDER BY createdAt ASC`,
        [participantId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get timer logs by participantId '${participantId}': ${err}`
        );
      });
    return rows.map((row) => this.recordToEntity(row));
  }
}
