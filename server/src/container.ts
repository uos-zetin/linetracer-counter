import {
  ActorSessionStore,
  DivisionProgressStateStore,
} from "@/core/interfaces";

import { ActorIdPwSQLiteRepository } from "@/infrastructure/repositories/actor-id-pw-sqlite";
import { ActorSQLiteRepository } from "@/infrastructure/repositories/actor-sqlite";
import { CompetitionSQLiteRepository } from "@/infrastructure/repositories/competition-sqlite";
import { DivisionSQLiteRepository } from "@/infrastructure/repositories/division-sqlite";
import { ManualRecordSQLiteRepository } from "@/infrastructure/repositories/manual-record-sqlite";
import { ParticipantSQLiteRepository } from "@/infrastructure/repositories/participant-sqlite";
import { RecordSQLiteRepository } from "@/infrastructure/repositories/record-sqlite";
import { TimerLogSQLiteRepository } from "@/infrastructure/repositories/timer-log-sqlite";

import { ActorSessionRandomStore } from "@/infrastructure/session/actor-session-random-store";
import { DivisionProgressStateFsStore } from "@/infrastructure/stores/division-progress-state-fs-store";

import { ActorService } from "@/core/services/actor";
import { CompetitionService } from "@/core/services/competition";
import { CompetitionActorService } from "@/core/services/competition.actor";
import { DivisionProgressService } from "@/core/services/division-progress";
import { DivisionProgressActorService } from "@/core/services/division-progress.actor";
import { ParticipantService } from "@/core/services/participant";
import { ParticipantActorService } from "@/core/services/participant.actor";

import sqlite3 from "sqlite3";

import { env } from "./env";

/**
 * 의존성 주입 컨테이너
 *
 * - 컨트롤러, 외부 스크립트 등에서 사용할 수 있는 의존성을 제공한다.
 * - 싱글턴 패턴을 사용하여 애플리케이션 전역에서 하나의 인스턴스만 제공한다.
 * - 초기화 메서드를 통해 데이터베이스 연결과 레포지토리 초기화를 수행한다.
 */
export class Container {
  private static _instance: Container | null = null;
  public static get instance(): Container {
    if (!Container._instance) {
      Container._instance = new Container();
    }
    return Container._instance;
  }

  // Database
  private readonly db: sqlite3.Database;
  private readonly dbState: {
    status: "pending" | "ready" | "error";
    error?: Error;
  };

  // Repositories
  private readonly actorIdPwSQLiteRepo: ActorIdPwSQLiteRepository;
  private readonly actorSQLiteRepo: ActorSQLiteRepository;
  private readonly competitionSQLiteRepo: CompetitionSQLiteRepository;
  private readonly divisionSQLiteRepo: DivisionSQLiteRepository;
  private readonly manualRecordSQLiteRepo: ManualRecordSQLiteRepository;
  private readonly participantSQLiteRepo: ParticipantSQLiteRepository;
  private readonly recordSQLiteRepo: RecordSQLiteRepository;
  private readonly timerLogSQLiteRepo: TimerLogSQLiteRepository;

  // Interfaces
  private readonly actorSessionStore: ActorSessionStore;
  private readonly divisionProgressStateStore: DivisionProgressStateStore;

  // Services
  private readonly actorService: ActorService;
  private readonly competitionService: CompetitionService;
  private readonly competitionActorService: CompetitionActorService;
  private readonly participantService: ParticipantService;
  private readonly participantActorService: ParticipantActorService;
  private readonly divisionProgressService: DivisionProgressService;
  private readonly divisionProgressActorService: DivisionProgressActorService;

  private constructor() {
    // SQLite Database
    this.dbState = { status: "pending" };
    this.db = new sqlite3.Database(env.SQLITE_DB_PATH, (err) => {
      if (err) {
        this.dbState.status = "error";
        this.dbState.error = err;
      } else {
        this.dbState.status = "ready";
      }
    });

    // Inject Repositories
    this.actorIdPwSQLiteRepo = new ActorIdPwSQLiteRepository(this.db);
    this.actorSQLiteRepo = new ActorSQLiteRepository(this.db);
    this.competitionSQLiteRepo = new CompetitionSQLiteRepository(this.db);
    this.divisionSQLiteRepo = new DivisionSQLiteRepository(this.db);
    this.manualRecordSQLiteRepo = new ManualRecordSQLiteRepository(this.db);
    this.participantSQLiteRepo = new ParticipantSQLiteRepository(this.db);
    this.recordSQLiteRepo = new RecordSQLiteRepository(this.db);
    this.timerLogSQLiteRepo = new TimerLogSQLiteRepository(this.db);

    // Inject Interfaces
    this.actorSessionStore = new ActorSessionRandomStore(
      { actorRepository: this.actorSQLiteRepo },
      32 // 256 bits
    );
    this.divisionProgressStateStore = new DivisionProgressStateFsStore(
      env.PROGRESS_STATE_DIR
    );

    // Instantiate Services
    this.actorService = new ActorService({
      actorRepository: this.actorSQLiteRepo,
      actorIdPwRepository: this.actorIdPwSQLiteRepo,
    });
    this.competitionService = new CompetitionService({
      competitionRepository: this.competitionSQLiteRepo,
      divisionRepository: this.divisionSQLiteRepo,
      participantRepository: this.participantSQLiteRepo,
      recordRepository: this.recordSQLiteRepo,
    });
    this.competitionActorService = new CompetitionActorService(
      this.competitionService
    );
    this.participantService = new ParticipantService({
      participantRepository: this.participantSQLiteRepo,
      recordRepository: this.recordSQLiteRepo,
      manualRecordRepository: this.manualRecordSQLiteRepo,
      timerLogRepository: this.timerLogSQLiteRepo,
    });
    this.participantActorService = new ParticipantActorService(
      this.participantService
    );
    this.divisionProgressService = new DivisionProgressService({
      competitionService: this.competitionService,
      participantService: this.participantService,
      divisionProgressStateStore: this.divisionProgressStateStore,
    });
    this.divisionProgressActorService = new DivisionProgressActorService(
      this.divisionProgressService
    );
  }

  private initialized = false;

  public async initialize() {
    if (this.initialized) return;

    await new Promise<void>((resolve, reject) => {
      const wait = () => {
        if (this.dbState.status === "ready") {
          resolve();
        } else if (this.dbState.status === "error") {
          reject(this.dbState.error);
        } else {
          setTimeout(wait, 100); // Retry every 100ms
        }
      };
      wait();
    });

    await Promise.all([
      this.competitionSQLiteRepo.initialize(),
      this.divisionSQLiteRepo.initialize(),
      this.actorSQLiteRepo.initialize(),
      this.actorIdPwSQLiteRepo.initialize(),
      this.manualRecordSQLiteRepo.initialize(),
      this.participantSQLiteRepo.initialize(),
      this.recordSQLiteRepo.initialize(),
      this.timerLogSQLiteRepo.initialize(),
    ]);

    this.initialized = true;
  }

  public get services() {
    return {
      actor: this.actorService,
      competition: this.competitionActorService,
      participant: this.participantActorService,
      divisionProgress: this.divisionProgressActorService,
    };
  }

  public get sessionStore() {
    return this.actorSessionStore;
  }
}

export default Container.instance;
