import {
  DivisionProgressState,
  DivisionProgressStateStore,
} from "@/core/interfaces";

import fs from "fs/promises";
import path from "path";

export class DivisionProgressStateFsStore
  implements DivisionProgressStateStore
{
  constructor(private readonly path: string) {}

  private readonly defaultState: DivisionProgressState = {
    runnerId: null,
    participantOrder: [],
  };

  private getFilePath(divisionId: string): string {
    return path.join(this.path, `${divisionId}.json`);
  }

  private async checkFileSystem(): Promise<void> {
    try {
      await fs.access(this.path);
    } catch {
      // 디렉터리가 존재하지 않으면 생성
      await fs.mkdir(this.path, { recursive: true });
    }

    try {
      // 쓰기 권한 확인
      await fs.access(this.path, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`No write permission to ${this.path}: ${error}`);
    }
  }

  async resetState(divisionId: string): Promise<void> {
    await this.checkFileSystem();

    const filePath = this.getFilePath(divisionId);
    await fs.rm(filePath, { force: true });
  }

  async setState(
    divisionId: string,
    state: DivisionProgressState
  ): Promise<void> {
    await this.checkFileSystem();

    const filePath = this.getFilePath(divisionId);
    await fs.writeFile(filePath, JSON.stringify(state));
  }

  async getState(divisionId: string): Promise<DivisionProgressState> {
    const filePath = this.getFilePath(divisionId);

    try {
      const state = await fs.readFile(filePath, "utf-8");
      return JSON.parse(state);
    } catch (error) {
      // 파일이 존재하지 않는 경우 기본값 반환
      const errnoError = error as NodeJS.ErrnoException;
      if (errnoError.code === "ENOENT") {
        return this.defaultState;
      }

      // JSON 파싱 오류인 경우 파일을 삭제하고 기본값 반환
      if (error instanceof SyntaxError) {
        console.error(
          `JSON parsing error in file ${filePath}, deleting corrupted file:`,
          error
        );
        await fs.rm(filePath, { force: true });
        return this.defaultState;
      }

      // 그 외의 오류는 로그만 남기고 기본값 반환
      console.error(`Error reading file ${filePath}:`, error);
      return this.defaultState;
    }
  }
}
