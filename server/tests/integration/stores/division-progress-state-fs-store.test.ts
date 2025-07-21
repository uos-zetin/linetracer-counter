import fs from "fs/promises";
import os from "os";
import path from "path";

import { v4 as uuidv4 } from "uuid";

import { DivisionProgressStateFsStore } from "@/infrastructure/stores/division-progress-state-fs-store";
import { testDivisionProgressStateStoreContract } from "../../shared/stores/division-progress-state-store.contract";

const tempDir = path.join(os.tmpdir(), `division-progress-test-${uuidv4()}`);

testDivisionProgressStateStoreContract(
  () => {
    return new DivisionProgressStateFsStore(tempDir);
  },
  async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
);
