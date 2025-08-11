import { Database } from "sqlite3";

type SQLiteAsyncRunResult = {
  changes: number;
};

export class SQLiteDatabaseAsyncWrapper {
  constructor(private db: Database) {}

  run(sql: string, params: any[] = []): Promise<SQLiteAsyncRunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else if (!row) resolve(null);
        else resolve(row as T);
      });
    });
  }

  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }
}
