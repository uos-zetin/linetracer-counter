import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Division } from "@/core/models";
import { DivisionRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "./utils/sqlite";
import sqlite3 from "sqlite3";

type DivisionRecord = {
  id: string;
  competitionId: string;
  name: string;
  timeLimit: number;
  description: string;
  createdAt: string;
  status: "ready" | "ongoing" | "closed";
  isDeleted: number;
};

export class DivisionSQLiteRepository implements DivisionRepository {
  private db: SQLiteDatabaseAsyncWrapper;
  private isInitialized = false;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<DivisionRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS divisions (
          id TEXT PRIMARY KEY NOT NULL,
          competitionId TEXT NOT NULL,
          name TEXT NOT NULL,
          timeLimit INTEGER NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          status TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      );
      // index [isDeleted, competitionId, createdAt]
      await this.db.run(
        `CREATE INDEX IF NOT EXISTS idx_divisions_isDeleted_competitionId_createdAt
          ON divisions (isDeleted, competitionId, createdAt DESC)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize Division database: ${err}`
      );
    }

    this.isInitialized = true;
    return this;
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new PersistenceError(`${this.constructor.name} is not initialized`);
    }
  }

  async getById(id: string): Promise<Division> {
    this.checkInitialization();

    const row = await this.db
      .get<DivisionRecord>(
        `SELECT *
          FROM divisions
          WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to fetch division(${id}): ${err}`);
      });

    if (!row) {
      throw new EntityNotFoundError(`Division with ID ${id} not found`);
    }

    return {
      id: row.id,
      competitionId: row.competitionId,
      name: row.name,
      timeLimit: row.timeLimit,
      description: row.description,
      createdAt: new Date(row.createdAt),
      status: row.status,
    };
  }

  async create(division: Division): Promise<Division> {
    this.checkInitialization();

    await this.db
      .run(
        `INSERT INTO divisions
          (id, competitionId, name, timeLimit, description, createdAt, status, isDeleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          division.id,
          division.competitionId,
          division.name,
          division.timeLimit,
          division.description,
          division.createdAt.toISOString(),
          division.status,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create division: ${err}`);
      });

    return division;
  }

  async update(division: Division): Promise<Division> {
    this.checkInitialization();

    const result = await this.db
      .run(
        `UPDATE divisions
          SET name = ?, timeLimit = ?, description = ?, createdAt = ?, status = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          division.name,
          division.timeLimit,
          division.description,
          division.createdAt.toISOString(),
          division.status,
          division.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to update division(${division.id}): ${err}`
        );
      });

    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `Division with ID ${division.id} not found`
      );
    }

    return division;
  }

  async delete(id: string): Promise<void> {
    this.checkInitialization();

    const result = await this.db
      .run(
        // soft delete
        `UPDATE divisions SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete division(${id}): ${err}`);
      });

    if (result.changes === 0) {
      throw new EntityNotFoundError(`Division with ID ${id} not found`);
    }
  }

  async getByCompetitionId(competitionId: string): Promise<Division[]> {
    this.checkInitialization();

    const rows = await this.db
      .all<DivisionRecord>(
        `SELECT id, competitionId, name, timeLimit, description, createdAt, status, isDeleted
         FROM divisions
         WHERE competitionId = ? AND isDeleted = 0
         ORDER BY createdAt DESC`,
        [competitionId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to fetch divisions for competition(${competitionId}): ${err}`
        );
      });

    return rows.map((row) => ({
      id: row.id,
      competitionId: row.competitionId,
      name: row.name,
      timeLimit: row.timeLimit,
      description: row.description,
      createdAt: new Date(row.createdAt),
      status: row.status,
    }));
  }
}
