import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { ManualRecord } from "@/core/models";
import { ManualRecordRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "@/utils/sqlite";
import sqlite3 from "sqlite3";

type ManualRecordRecord = {
  id: string;
  participantId: string;
  value: number;
  recorderName: string;
  createdAt: string;
  invalidatedAt: string | null;
  isDeleted: number;
};

export class ManualRecordSQLiteRepository implements ManualRecordRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<ManualRecordRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS manual_records (
          id TEXT PRIMARY KEY NOT NULL,
          participantId TEXT NOT NULL,
          value INTEGER NOT NULL,
          recorderName TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          invalidatedAt TEXT,
          isDeleted INTEGER NOT NULL
        )`
      );
      await this.db.run(
        // index [participantId, createdAt]
        `CREATE INDEX IF NOT EXISTS idx_manual_records_participantId_createdAt
          ON manual_records (participantId, createdAt)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize ManualRecord database: ${err}`
      );
    }
    return this;
  }

  private recordToEntity(record: ManualRecordRecord): ManualRecord {
    return {
      id: record.id,
      participantId: record.participantId,
      value: record.value,
      recorderName: record.recorderName,
      createdAt: new Date(record.createdAt),
      invalidatedAt: record.invalidatedAt
        ? new Date(record.invalidatedAt)
        : null,
    };
  }

  async getById(id: string): Promise<ManualRecord> {
    const row = await this.db
      .get<ManualRecordRecord>(
        `SELECT * FROM manual_records WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get manual record by id '${id}': ${err}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(`ManualRecord with id '${id}' not found`);
    }
    return this.recordToEntity(row);
  }

  async create(manualRecord: ManualRecord): Promise<ManualRecord> {
    await this.db
      .run(
        `INSERT INTO manual_records (id, participantId, value, recorderName, createdAt, invalidatedAt, isDeleted)
          VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          manualRecord.id,
          manualRecord.participantId,
          manualRecord.value,
          manualRecord.recorderName,
          manualRecord.createdAt.toISOString(),
          manualRecord.invalidatedAt?.toISOString() || null,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create ManualRecord: ${err}`);
      });
    return manualRecord;
  }

  async update(manualRecord: ManualRecord): Promise<ManualRecord> {
    const result = await this.db
      .run(
        `UPDATE manual_records
          SET participantId = ?, value = ?, recorderName = ?, createdAt = ?, invalidatedAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          manualRecord.participantId,
          manualRecord.value,
          manualRecord.recorderName,
          manualRecord.createdAt.toISOString(),
          manualRecord.invalidatedAt?.toISOString() || null,
          manualRecord.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update ManualRecord: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `ManualRecord with ID ${manualRecord.id} not found`
      );
    }
    return manualRecord;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(
        `UPDATE manual_records SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete ManualRecord: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`ManualRecord with ID ${id} not found`);
    }
  }

  async getByParticipantId(participantId: string): Promise<ManualRecord[]> {
    const rows = await this.db
      .all<ManualRecordRecord>(
        `SELECT * FROM manual_records
          WHERE participantId = ? AND isDeleted = 0
          ORDER BY createdAt ASC`,
        [participantId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get manual records by participantId '${participantId}': ${err}`
        );
      });
    return rows.map((row) => this.recordToEntity(row));
  }
}
