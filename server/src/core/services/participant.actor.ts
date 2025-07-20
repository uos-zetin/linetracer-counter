import {
  Actor,
  ManualRecord,
  Participant,
  Record,
  TimerLog,
} from "@/core/models";
import { requireAnyRole } from "@/core/utils/auth";

import { ParticipantService } from "./participant";

export class ParticipantActorService {
  constructor(private readonly service: ParticipantService) {}

  async addParticipant(
    actor: Actor,
    divisionId: string,
    name: string,
    teamName: string,
    robotName: string,
    comment: string,
    orderRaw: number,
    givenTime: number
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");
    return this.service.addParticipant(
      divisionId,
      name,
      teamName,
      robotName,
      comment,
      orderRaw,
      givenTime
    );
  }

  async getParticipants(
    actor: Actor,
    divisionId: string
  ): Promise<Participant[]> {
    return this.service.getParticipants(divisionId);
  }

  async updateParticipant(
    actor: Actor,
    participantId: string,
    data: {
      name?: string;
      teamName?: string;
      robotName?: string;
      comment?: string;
      orderRaw?: number;
      givenTime?: number;
    }
  ): Promise<Participant> {
    requireAnyRole(actor, "administrator");
    return this.service.updateParticipant(participantId, data);
  }

  async deleteParticipant(actor: Actor, participantId: string): Promise<void> {
    requireAnyRole(actor, "administrator");
    return this.service.deleteParticipant(participantId);
  }

  async getRecords(actor: Actor, participantId: string): Promise<Record[]> {
    return this.service.getRecords(participantId);
  }

  async addRecord(
    actor: Actor,
    participantId: string,
    value: number,
    source: Record["source"],
    note: string
  ): Promise<Record> {
    requireAnyRole(actor, "administrator");
    return this.service.addRecord(participantId, value, source, note);
  }

  async setRecordNote(
    actor: Actor,
    recordId: string,
    note: string
  ): Promise<Record> {
    requireAnyRole(actor, "administrator");
    return this.service.setRecordNote(recordId, note);
  }

  async setRecordStatus(
    actor: Actor,
    recordId: string,
    status: Record["status"]
  ): Promise<Record> {
    requireAnyRole(actor, "administrator");
    return this.service.setRecordStatus(recordId, status);
  }

  async getManualRecords(
    actor: Actor,
    participantId: string
  ): Promise<ManualRecord[]> {
    return this.service.getManualRecords(participantId);
  }

  async addManualRecord(
    actor: Actor,
    participantId: string,
    value: number,
    recorderName: string
  ): Promise<ManualRecord> {
    requireAnyRole(actor, "administrator", "manualRecorder");
    return this.service.addManualRecord(participantId, value, recorderName);
  }

  async startTimer(actor: Actor, participantId: string): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");
    return this.service.startTimer(participantId);
  }

  async stopTimer(actor: Actor, participantId: string): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");
    return this.service.stopTimer(participantId);
  }

  async adjustTimer(
    actor: Actor,
    participantId: string,
    adjustmentMs: number
  ): Promise<TimerLog> {
    requireAnyRole(actor, "administrator");
    return this.service.adjustTimer(participantId, adjustmentMs);
  }

  async getTimerLogs(actor: Actor, participantId: string): Promise<TimerLog[]> {
    return this.service.getTimerLogs(participantId);
  }
}
