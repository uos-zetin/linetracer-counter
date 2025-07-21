import os from "os";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  override: false, // 시스템 환경변수를 우선적으로 사용
});

export type Env = {
  SQLITE_DB_PATH: string;
  PROGRESS_STATE_DIR: string;
};

export const env: Env = {
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || ":memory:",
  PROGRESS_STATE_DIR:
    process.env.PROGRESS_STATE_DIR ||
    path.join(os.tmpdir(), "division-progress-state"),
};
