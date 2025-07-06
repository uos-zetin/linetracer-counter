import dotenv from "dotenv";

dotenv.config({
  override: false, // 시스템 환경변수를 우선적으로 사용
});

export type Env = {
  SQLITE_DB_PATH: string;
};

export const env: Env = {
  SQLITE_DB_PATH: process.env.SQLITE_DB_PATH || ":memory:",
};
