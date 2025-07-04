import { Database } from "sqlite3";

import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Competition } from "@/core/models";
import { CompetitionRepository } from "@/core/repositories";

type CompetitionRecord = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isDeleted: number;
};

export class CompetitionSQLiteRepository implements CompetitionRepository {
  private db: Database;
  private isInitialized = false;

  constructor(db: Database) {
    this.db = db;
  }

  async initialize(): Promise<CompetitionRepository> {
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS competitions (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`,
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to create competitions table: ${err.message}`
              )
            );
          } else {
            resolve();
          }
        }
      );
    });

    // WHERE 절로 isDeleted 조건을 건 후, createdAt DESC로 정렬하는 쿼리에 대응
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `CREATE INDEX IF NOT EXISTS idx_competitions_isDeleted_createdAt
        ON competitions (isDeleted, createdAt DESC)`,
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to create index on competitions: ${err.message}`
              )
            );
          } else {
            resolve();
          }
        }
      );
    });

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

    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, name, description, createdAt, isDeleted
          FROM competitions
          WHERE isDeleted = 0
          ORDER BY createdAt DESC`,
        function (err, rows) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to fetch competitions: ${err.message}`
              )
            );
          } else {
            const data = rows as CompetitionRecord[];
            resolve(
              data.map((row) => ({
                id: row.id,
                name: row.name,
                description: row.description,
                createdAt: new Date(row.createdAt),
              }))
            );
          }
        }
      );
    });
  }

  async getById(id: string): Promise<Competition> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT id, name, description, createdAt, isDeleted
          FROM competitions
          WHERE id = ? AND isDeleted = 0`,
        [id],
        function (err, row) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to fetch competition(${id}): ${err.message}`
              )
            );
          } else if (!row) {
            reject(
              new EntityNotFoundError(`Competition with ID ${id} not found`)
            );
          } else {
            const data = row as CompetitionRecord;
            resolve({
              id: data.id,
              name: data.name,
              description: data.description,
              createdAt: new Date(data.createdAt),
            });
          }
        }
      );
    });
  }

  async create(competition: Competition): Promise<Competition> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO competitions (id, name, description, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, 0)`,
        [
          competition.id,
          competition.name,
          competition.description,
          competition.createdAt.toISOString(),
        ],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to create competition: ${err.message}`
              )
            );
          } else {
            resolve(competition);
          }
        }
      );
    });
  }

  async update(competition: Competition): Promise<Competition> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE competitions SET name = ?, description = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          competition.name,
          competition.description,
          competition.createdAt.toISOString(),
          competition.id,
        ],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to update competition(${competition.id}): ${err.message}`
              )
            );
          } else if (this.changes === 0) {
            reject(
              new EntityNotFoundError(
                `Competition with ID ${competition.id} not found`
              )
            );
          } else {
            resolve(competition);
          }
        }
      );
    });
  }

  async delete(id: string): Promise<void> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.run(
        // soft delete
        `UPDATE competitions SET isDeleted = 1 WHERE id = ?`,
        [id],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to delete competition(${id}): ${err.message}`
              )
            );
          } else if (this.changes === 0) {
            reject(
              new EntityNotFoundError(`Competition with ID ${id} not found`)
            );
          } else {
            resolve();
          }
        }
      );
    });
  }
}
