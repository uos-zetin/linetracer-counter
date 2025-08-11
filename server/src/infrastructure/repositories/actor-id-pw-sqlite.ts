import { EntityNotFoundError, PersistenceError } from "@/core/errors";
import { ActorIdPw } from "@/core/models";
import { ActorIdPwRepository } from "@/core/repositories";

import { SQLiteDatabaseAsyncWrapper } from "./utils/sqlite";
import sqlite3 from "sqlite3";

type ActorIdPwRecord = {
  id: string;
  actorId: string;
  username: string;
  hashedPassword: string;
  createdAt: string;
};

export class ActorIdPwSQLiteRepository implements ActorIdPwRepository {
  private db: SQLiteDatabaseAsyncWrapper;

  constructor(db: sqlite3.Database) {
    this.db = new SQLiteDatabaseAsyncWrapper(db);
  }

  async initialize(): Promise<ActorIdPwRepository> {
    try {
      await this.db.run(
        `CREATE TABLE IF NOT EXISTS actor_id_pw (
          id TEXT PRIMARY KEY NOT NULL,
          actorId TEXT NOT NULL,
          username TEXT NOT NULL,
          hashedPassword TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )`
      );
      await this.db.run(
        // index [username]
        `CREATE INDEX IF NOT EXISTS idx_actor_id_pw_username
          ON actor_id_pw (username)`
      );
      await this.db.run(
        // index [actorId]
        `CREATE INDEX IF NOT EXISTS idx_actor_id_pw_actorId
          ON actor_id_pw (actorId)`
      );
    } catch (err) {
      throw new PersistenceError(
        `Failed to initialize ActorIdPw database: ${err}`
      );
    }
    return this;
  }

  private recordToEntity(record: ActorIdPwRecord): ActorIdPw {
    return {
      id: record.id,
      actorId: record.actorId,
      username: record.username,
      hashedPassword: record.hashedPassword,
      createdAt: new Date(record.createdAt),
    };
  }

  async getByUsername(username: string): Promise<ActorIdPw> {
    const row = await this.db
      .get<ActorIdPwRecord>(
        `SELECT * FROM actor_id_pw
          WHERE username = ?`,
        [username]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get actor_id_pw by username '${username}': ${err.message}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(
        `ActorIdPw with username '${username}' not found`
      );
    }
    return this.recordToEntity(row);
  }

  async getByActorId(actorId: string): Promise<ActorIdPw> {
    const row = await this.db
      .get<ActorIdPwRecord>(
        `SELECT * FROM actor_id_pw
          WHERE actorId = ?`,
        [actorId]
      )
      .catch((err) => {
        throw new PersistenceError(
          `Failed to get actor_id_pw by actorId '${actorId}': ${err.message}`
        );
      });
    if (!row) {
      throw new EntityNotFoundError(
        `ActorIdPw with actorId '${actorId}' not found`
      );
    }
    return this.recordToEntity(row);
  }

  async create(actorIdPw: ActorIdPw): Promise<ActorIdPw> {
    await this.db
      .run(
        `INSERT INTO actor_id_pw (id, actorId, username, hashedPassword, createdAt)
          VALUES (?, ?, ?, ?, ?)`,
        [
          actorIdPw.id,
          actorIdPw.actorId,
          actorIdPw.username,
          actorIdPw.hashedPassword,
          actorIdPw.createdAt.toISOString(),
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to create ActorIdPw: ${err}`);
      });
    return actorIdPw;
  }

  async update(actorIdPw: ActorIdPw): Promise<ActorIdPw> {
    const result = await this.db
      .run(
        `UPDATE actor_id_pw
          SET actorId = ?, username = ?, hashedPassword = ?, createdAt = ?
          WHERE id = ?`,
        [
          actorIdPw.actorId,
          actorIdPw.username,
          actorIdPw.hashedPassword,
          actorIdPw.createdAt.toISOString(),
          actorIdPw.id,
        ]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to update ActorIdPw: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(
        `ActorIdPw with ID ${actorIdPw.id} not found`
      );
    }
    return actorIdPw;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db
      .run(
        `DELETE FROM actor_id_pw
          WHERE id = ?`,
        [id]
      )
      .catch((err) => {
        throw new PersistenceError(`Failed to delete ActorIdPw: ${err}`);
      });
    if (result.changes === 0) {
      throw new EntityNotFoundError(`ActorIdPw with ID ${id} not found`);
    }
  }
}
