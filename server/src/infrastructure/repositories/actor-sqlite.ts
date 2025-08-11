import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { Actor } from "@/core/models";
import { ActorRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "./utils/sqlite";
import sqlite3 from "sqlite3";

type ActorRecord = {
  id: string;
  name: string;
  roles: string; // JSON 문자열로 저장
  createdAt: string;
  isDeleted: number;
};

export class ActorSQLiteRepository implements ActorRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<ActorRepository> {
    await this.db
      .run(
        `CREATE TABLE IF NOT EXISTS actors (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          roles TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isDeleted INTEGER NOT NULL
        )`
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to create actors table: ${err.message}`
        );
      });
    return this;
  }

  private recordToEntity(record: ActorRecord): Actor {
    let roles = [];
    try {
      roles = JSON.parse(record.roles);
    } catch (err) {
      throw new PersistenceError(
        `Failed to parse roles '${record.roles}' for actor ${record.id}: ${err}`
      );
    }
    return {
      id: record.id,
      name: record.name,
      roles,
      createdAt: new Date(record.createdAt),
    };
  }

  async getAll(): Promise<Actor[]> {
    const rows = await this.db
      .all<ActorRecord>(
        `SELECT * FROM actors
          WHERE isDeleted = 0`
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to fetch actors: ${err}`);
      });
    return rows.map(this.recordToEntity);
  }

  async getById(id: string): Promise<Actor> {
    const row = await this.db
      .get<ActorRecord>(
        `SELECT * FROM actors
          WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to fetch actor by ID: ${err}`);
      });
    if (!row) {
      throw new EntityNotFoundError(`Actor with ID ${id} not found`);
    }
    return this.recordToEntity(row);
  }

  async create(actor: Actor): Promise<Actor> {
    await this.db
      .run(
        `INSERT INTO actors (id, name, roles, createdAt, isDeleted)
          VALUES (?, ?, ?, ?, 0)`,
        [
          actor.id,
          actor.name,
          JSON.stringify(actor.roles),
          actor.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create actor: ${err}`);
      });
    return actor;
  }

  async update(actor: Actor): Promise<Actor> {
    const result = await this.db
      .run(
        `UPDATE actors
          SET name = ?, roles = ?, createdAt = ?
          WHERE id = ? AND isDeleted = 0`,
        [
          actor.name,
          JSON.stringify(actor.roles),
          actor.createdAt.toISOString(),
          actor.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update actor: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`Actor with ID ${actor.id} not found`);
    }
    return actor;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(
        `UPDATE actors SET isDeleted = 1
          WHERE id = ? AND isDeleted = 0`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete actor: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`Actor with ID ${id} not found`);
    }
  }
}
