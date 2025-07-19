import { ActorSessionStore } from "@/core/interfaces";
import {
  ActorService,
  CompetitionService,
  ManualRecordService,
  ParticipantService,
  RecordService,
  TimerLogService,
} from "@/core/services";

import { ActorIdPwSQLiteRepository } from "@/infrastructure/repositories/actor-id-pw-sqlite";
import { ActorSQLiteRepository } from "@/infrastructure/repositories/actor-sqlite";
import { CompetitionSQLiteRepository } from "@/infrastructure/repositories/competition-sqlite";
import { DivisionSQLiteRepository } from "@/infrastructure/repositories/division-sqlite";
import { ManualRecordSQLiteRepository } from "@/infrastructure/repositories/manual-record-sqlite";
import { ParticipantSQLiteRepository } from "@/infrastructure/repositories/participant-sqlite";
import { RecordSQLiteRepository } from "@/infrastructure/repositories/record-sqlite";
import { TimerLogSQLiteRepository } from "@/infrastructure/repositories/timer-log-sqlite";

import { ActorSessionRandomStore } from "@/infrastructure/session/actor-session-random-store";

import { ActorServiceImpl } from "@/services/actor";
import { CompetitionServiceImpl } from "@/services/competition";
import { ManualRecordServiceImpl } from "@/services/manual-record";
import { ParticipantServiceImpl } from "@/services/participant";
import { RecordServiceImpl } from "@/services/record";
import { TimerLogServiceImpl } from "@/services/timer-log";

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

  // Services
  private readonly actorService: ActorService;
  private readonly competitionService: CompetitionService;
  private readonly manualRecordService: ManualRecordService;
  private readonly participantService: ParticipantService;
  private readonly recordService: RecordService;
  private readonly timerLogService: TimerLogService;

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

    // Instantiate Services
    this.actorService = new ActorServiceImpl({
      actorRepository: this.actorSQLiteRepo,
      actorIdPwRepository: this.actorIdPwSQLiteRepo,
    });
    this.competitionService = new CompetitionServiceImpl({
      competitionRepository: this.competitionSQLiteRepo,
      divisionRepository: this.divisionSQLiteRepo,
    });
    this.participantService = new ParticipantServiceImpl({
      participantRepository: this.participantSQLiteRepo,
    });
    this.recordService = new RecordServiceImpl({
      recordRepository: this.recordSQLiteRepo,
      participantRepository: this.participantSQLiteRepo,
    });
    this.manualRecordService = new ManualRecordServiceImpl({
      manualRecordRepository: this.manualRecordSQLiteRepo,
    });
    this.timerLogService = new TimerLogServiceImpl({
      timerLogRepository: this.timerLogSQLiteRepo,
    });
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
      competition: this.competitionService,
      manualRecord: this.manualRecordService,
      participant: this.participantService,
      record: this.recordService,
      timerLog: this.timerLogService,
    };
  }

  public get sessionStore() {
    return this.actorSessionStore;
  }
}

export default Container.instance;
