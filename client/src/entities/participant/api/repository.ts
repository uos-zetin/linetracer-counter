import type { Fetcher } from "@/shared/api";
import { parseParticipantDto } from "../lib/parse-dto";
import type { Participant, ParticipantForm } from "../model/types";
import type { ParticipantCreateDto, ParticipantDto, ParticipantRepository } from "./types";

export class ParticipantFetcherRepository implements ParticipantRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllParticipants(divisionId: string): Promise<Participant[]> {
    const response = await this.fetcher.get<ParticipantDto[]>(`/divisions/${divisionId}/participants`);
    return response.data.map((dto) => parseParticipantDto(dto));
  }

  async createParticipant(divisionId: string, participant: ParticipantForm): Promise<Participant> {
    const response = await this.authFetcher.post<ParticipantDto>(`/divisions/${divisionId}/participants`, {
      body: {
        name: participant.name,
        teamName: participant.teamName,
        robotName: participant.robotName,
        comment: participant.comment,
        orderRaw: participant.orderRaw,
      } as ParticipantCreateDto,
    });
    return parseParticipantDto(response.data);
  }

  async updateParticipant(participantId: string, participant: Participant): Promise<Participant | null> {
    const response = await this.authFetcher.patch<ParticipantDto>(`/participants/${participantId}`, {
      body: {
        name: participant.name,
        teamName: participant.teamName,
        robotName: participant.robotName,
        comment: participant.comment,
        orderRaw: participant.orderRaw,
      } as ParticipantCreateDto,
    });
    return response.data ? parseParticipantDto(response.data) : null;
  }

  async deleteParticipant(participantId: string): Promise<void> {
    await this.authFetcher.delete(`/participants/${participantId}`);
  }
}
