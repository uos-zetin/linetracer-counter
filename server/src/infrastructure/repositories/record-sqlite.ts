import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Record } from "@/core/models";
import { RecordRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "./utils/sqlite";
import sqlite3 from "sqlite3";

type RecordRecord = {
  id: string;
  participantId: string;
  value: number;
  source: string;
  status: string;
  note: string;
  createdAt: string;
  isDeleted: number;
};

export class RecordSQLiteRepository implements RecordRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<RecordRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS records (
          id TEXT PRIMARY KEY NOT NULL,
          participantId TEXT NOT NULL,
          value INTEGER NOT NULL,
          source TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      );
      await this.db.run(
        // index [participantId, createdAt]
        `CREATE INDEX IF NOT EXISTS idx_records_participantId_createdAt
          ON records (participantId, createdAt)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize Record database: ${err}`
      );
    }
    return this;
  }

  private recordToEntity(record: RecordRecord): Record {
    return {
      id: record.id,
      participantId: record.participantId,
      value: record.value,
      source: record.source as Record["source"],
      status: record.status as Record["status"],
      note: record.note,
      createdAt: new Date(record.createdAt),
    };
  }

  async getById(id: string): Promise<Record> {
    const row = await this.db
      .get<RecordRecord>(
        `SELECT * FROM records WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get record by id '${id}': ${err}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(`Record with id '${id}' not found`);
    }
    return this.recordToEntity(row);
  }

  async create(record: Record): Promise<Record> {
    await this.db
      .run(
        `INSERT INTO records (id, participantId, value, source, status, note, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          record.id,
          record.participantId,
          record.value,
          record.source,
          record.status,
          record.note,
          record.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create Record: ${err}`);
      });
    return record;
  }

  async update(record: Record): Promise<Record> {
    const result = await this.db
      .run(
        `UPDATE records
          SET participantId = ?, value = ?, source = ?, status = ?, note = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          record.participantId,
          record.value,
          record.source,
          record.status,
          record.note,
          record.createdAt.toISOString(),
          record.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update Record: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`Record with ID ${record.id} not found`);
    }
    return record;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(`UPDATE records SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`, [
        id,
      ])
      .catch((err) => {
        throw new PersistenceError(`Failed to delete Record: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`Record with ID ${id} not found`);
    }
  }

  async getByParticipantId(participantId: string): Promise<Record[]> {
    const rows = await this.db
      .all<RecordRecord>(
        `SELECT * FROM records
          WHERE participantId = ? AND isDeleted = 0
          ORDER BY createdAt ASC`,
        [participantId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get records by participantId '${participantId}': ${err}`
        );
      });
    return rows.map((row) => this.recordToEntity(row));
  }
}
