import {
  Actor,
  ActorIdPw,
  Competition,
  Division,
  ManualRecord,
  Participant,
  Record,
  TimerLog,
} from "./models";

export interface CompetitionRepository {
  getAll(): Promise<Competition[]>;
  getById(id: string): Promise<Competition>;
  create(competition: Competition): Promise<Competition>;
  update(competition: Competition): Promise<Competition>;
  delete(id: string): Promise<void>;
}

export interface DivisionRepository {
  getById(id: string): Promise<Division>;
  create(division: Division): Promise<Division>;
  update(division: Division): Promise<Division>;
  delete(id: string): Promise<void>;
  getByCompetitionId(competitionId: string): Promise<Division[]>;
}

export interface ParticipantRepository {
  getById(id: string): Promise<Participant>;
  create(participant: Participant): Promise<Participant>;
  update(participant: Participant): Promise<Participant>;
  delete(id: string): Promise<void>;
  getByDivisionId(divisionId: string): Promise<Participant[]>;
}

export interface RecordRepository {
  getById(id: string): Promise<Record>;
  create(record: Record): Promise<Record>;
  update(record: Record): Promise<Record>;
  delete(id: string): Promise<void>;
  getByParticipantId(participantId: string): Promise<Record[]>;
}

export interface ManualRecordRepository {
  getById(id: string): Promise<ManualRecord>;
  create(manualRecord: ManualRecord): Promise<ManualRecord>;
  update(manualRecord: ManualRecord): Promise<ManualRecord>;
  delete(id: string): Promise<void>;
  getByParticipantId(participantId: string): Promise<ManualRecord[]>;
}

export interface TimerLogRepository {
  getById(id: string): Promise<TimerLog>;
  create(timerLog: TimerLog): Promise<TimerLog>;
  update(timerLog: TimerLog): Promise<TimerLog>;
  delete(id: string): Promise<void>;
  getByParticipantId(participantId: string): Promise<TimerLog[]>;
}

export interface ActorRepository {
  getAll(): Promise<Actor[]>;
  getById(id: string): Promise<Actor>;
  create(actor: Actor): Promise<Actor>;
  update(actor: Actor): Promise<Actor>;
  delete(id: string): Promise<void>;
}

export interface ActorIdPwRepository {
  getByUsername(username: string): Promise<ActorIdPw>;
  getByActorId(actorId: string): Promise<ActorIdPw>;
  create(actorIdPw: ActorIdPw): Promise<ActorIdPw>;
  update(actorIdPw: ActorIdPw): Promise<ActorIdPw>;
  delete(id: string): Promise<void>;
}
