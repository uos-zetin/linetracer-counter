import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Participant } from "@/core/models";
import { ParticipantRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "@/utils/sqlite";
import sqlite3 from "sqlite3";

type ParticipantRecord = {
  id: string;
  divisionId: string;
  name: string;
  teamName: string;
  robotName: string;
  comment: string;
  orderRaw: number;
  givenTime: number;
  createdAt: string;
  isDeleted: number;
};

export class ParticipantSQLiteRepository implements ParticipantRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<ParticipantRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY NOT NULL,
          divisionId TEXT NOT NULL,
          name TEXT NOT NULL,
          teamName TEXT NOT NULL,
          robotName TEXT NOT NULL,
          comment TEXT NOT NULL,
          orderRaw INTEGER NOT NULL,
          givenTime INTEGER NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      );
      await this.db.run(
        // index [divisionId, orderRaw]
        `CREATE INDEX IF NOT EXISTS idx_participants_divisionId_orderRaw
          ON participants (divisionId, orderRaw)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize Participant database: ${err}`
      );
    }
    return this;
  }

  private recordToEntity(record: ParticipantRecord): Participant {
    return {
      id: record.id,
      divisionId: record.divisionId,
      name: record.name,
      teamName: record.teamName,
      robotName: record.robotName,
      comment: record.comment,
      orderRaw: record.orderRaw,
      givenTime: record.givenTime,
      createdAt: new Date(record.createdAt),
    };
  }

  async getById(id: string): Promise<Participant> {
    const row = await this.db
      .get<ParticipantRecord>(
        `SELECT * FROM participants
          WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get participant by id '${id}': ${err}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(`Participant with id '${id}' not found`);
    }
    return this.recordToEntity(row);
  }

  async create(participant: Participant): Promise<Participant> {
    await this.db
      .run(
        `INSERT INTO participants (id, divisionId, name, teamName, robotName, comment, orderRaw, givenTime, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          participant.id,
          participant.divisionId,
          participant.name,
          participant.teamName,
          participant.robotName,
          participant.comment,
          participant.orderRaw,
          participant.givenTime,
          participant.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create Participant: ${err}`);
      });
    return participant;
  }

  async update(participant: Participant): Promise<Participant> {
    const result = await this.db
      .run(
        `UPDATE participants
          SET divisionId = ?, name = ?, teamName = ?, robotName = ?, comment = ?, orderRaw = ?, givenTime = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          participant.divisionId,
          participant.name,
          participant.teamName,
          participant.robotName,
          participant.comment,
          participant.orderRaw,
          participant.givenTime,
          participant.createdAt.toISOString(),
          participant.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update Participant: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `Participant with ID ${participant.id} not found`
      );
    }
    return participant;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(
        `UPDATE participants SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete Participant: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`Participant with ID ${id} not found`);
    }
  }

  async getByDivisionId(divisionId: string): Promise<Participant[]> {
    const rows = await this.db
      .all<ParticipantRecord>(
        `SELECT * FROM participants
          WHERE divisionId = ? AND isDeleted = 0
          ORDER BY orderRaw ASC`,
        [divisionId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get participants by divisionId '${divisionId}': ${err}`
        );
      });
    return rows.map((row) => this.recordToEntity(row));
  }
}
