import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Competition } from "@/core/models";
import { CompetitionRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "./utils/sqlite";
import sqlite3 from "sqlite3";

type CompetitionRecord = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isDeleted: number;
};

export class CompetitionSQLiteRepository implements CompetitionRepository {
  private db: SQLiteDatabaseAsyncWrapper;
  private isInitialized = false;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<CompetitionRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS competitions (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      );
      // index [isDeleted, createdAt]
      await this.db.run(
        `CREATE INDEX IF NOT EXISTS idx_competitions_isDeleted_createdAt
          ON competitions (isDeleted, createdAt DESC)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize Competition database: ${err}`
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

  async getAll(): Promise<Competition[]> {
    this.checkInitialization();

    const rows = await this.db
      .all<CompetitionRecord>(
        `SELECT id, name, description, createdAt, isDeleted
          FROM competitions
          WHERE isDeleted = 0
          ORDER BY createdAt DESC`
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to fetch competitions: ${err}`);
      });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.createdAt),
    }));
  }

  async getById(id: string): Promise<Competition> {
    this.checkInitialization();

    const row = await this.db
      .get<CompetitionRecord>(
        `SELECT id, name, description, createdAt, isDeleted
          FROM competitions
          WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to fetch competition(${id}): ${err}`
        );
      });

    if (!row) {
      throw new EntityNotFoundError(`Competition with ID ${id} not found`);
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.createdAt),
    };
  }

  async create(competition: Competition): Promise<Competition> {
    this.checkInitialization();

    await this.db
      .run(
        `INSERT INTO competitions (id, name, description, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, 0)`,
        [
          competition.id,
          competition.name,
          competition.description,
          competition.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create competition: ${err}`);
      });

    return competition;
  }

  async update(competition: Competition): Promise<Competition> {
    this.checkInitialization();

    const result = await this.db
      .run(
        `UPDATE competitions SET name = ?, description = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          competition.name,
          competition.description,
          competition.createdAt.toISOString(),
          competition.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to update competition(${competition.id}): ${err}`
        );
      });

    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `Competition with ID ${competition.id} not found`
      );
    }

    return competition;
  }

  async delete(id: string): Promise<void> {
    this.checkInitialization();

    const result = await this.db
      .run(
        // soft delete
        `UPDATE competitions SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to delete competition(${id}): ${err}`
        );
      });

    if (result.changes === 0) {
      throw new EntityNotFoundError(`Competition with ID ${id} not found`);
    }
  }
}
