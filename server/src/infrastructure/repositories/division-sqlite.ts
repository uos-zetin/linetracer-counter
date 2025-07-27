import { Database } from "sqlite3";

import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Division } from "@/core/models";
import { DivisionRepository } from "@/core/repositories";

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
  private db: Database;
  private isInitialized = false;

  constructor(db: Database) {
    this.db = db;
  }

  async initialize(): Promise<DivisionRepository> {
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS divisions (
          id TEXT PRIMARY KEY NOT NULL,
          competitionId TEXT NOT NULL,
          name TEXT NOT NULL,
          timeLimit INTEGER NOT NULL,
          description TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          status TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`,
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to create divisions table: ${err.message}`
              )
            );
          } else {
            resolve();
          }
        }
      );
    });

    // WHERE 절로 isDeleted, competitionId 조건을 건 후, createdAt DESC로 정렬하는 쿼리에 대응
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        `CREATE INDEX IF NOT EXISTS idx_divisions_isDeleted_competitionId_createdAt
          ON divisions (isDeleted, competitionId, createdAt DESC)`,
        (err) => {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to create index on divisions: ${err.message}`
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

  async getById(id: string): Promise<Division> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT *
          FROM divisions
          WHERE id = ? AND isDeleted = 0`,
        [id],
        (err, row) => {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to fetch division(${id}): ${err.message}`
              )
            );
          } else if (!row) {
            reject(new EntityNotFoundError(`Division with ID ${id} not found`));
          } else {
            const data = row as DivisionRecord;
            resolve({
              id: data.id,
              competitionId: data.competitionId,
              name: data.name,
              timeLimit: data.timeLimit,
              description: data.description,
              createdAt: new Date(data.createdAt),
              status: data.status,
            });
          }
        }
      );
    });
  }

  async create(division: Division): Promise<Division> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.run(
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
        ],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(`Failed to create division: ${err.message}`)
            );
          } else {
            resolve(division);
          }
        }
      );
    });
  }

  async update(division: Division): Promise<Division> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.run(
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
        ],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to update division(${division.id}): ${err.message}`
              )
            );
          } else if (this.changes === 0) {
            reject(
              new EntityNotFoundError(
                `Division with ID ${division.id} not found`
              )
            );
          } else {
            resolve(division);
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
        `UPDATE divisions SET isDeleted = 1 WHERE id = ? AND isDeleted = 0`,
        [id],
        function (err) {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to delete division(${id}): ${err.message}`
              )
            );
          } else if (this.changes === 0) {
            reject(new EntityNotFoundError(`Division with ID ${id} not found`));
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getByCompetitionId(competitionId: string): Promise<Division[]> {
    this.checkInitialization();

    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, competitionId, name, timeLimit, description, createdAt, status, isDeleted
         FROM divisions
         WHERE competitionId = ? AND isDeleted = 0
         ORDER BY createdAt DESC`,
        [competitionId],
        (err, rows) => {
          if (err) {
            reject(
              new PersistenceError(
                `Failed to fetch divisions for competition(${competitionId}): ${err.message}`
              )
            );
          } else {
            const data: DivisionRecord[] = rows as DivisionRecord[];
            resolve(
              data.map((row) => ({
                id: row.id,
                competitionId: row.competitionId,
                name: row.name,
                timeLimit: row.timeLimit,
                description: row.description,
                createdAt: new Date(row.createdAt),
                status: row.status,
              }))
            );
          }
        }
      );
    });
  }
}
