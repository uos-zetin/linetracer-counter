import type { Fetcher } from "@/shared/api";
import { parseParticipantDto, parseParticipantForm } from "../lib/parse-dto";
import type { Participant, ParticipantForm } from "../model/types";
import type { ParticipantDto, ParticipantRepository } from "./types";

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
      body: parseParticipantForm(participant),
    });
    return parseParticipantDto(response.data);
  }

  async updateParticipant(participantId: string, participant: Participant): Promise<Participant | null> {
    const response = await this.authFetcher.patch<ParticipantDto>(`/participants/${participantId}`, {
      body: parseParticipantForm(participant),
    });
    return response.data ? parseParticipantDto(response.data) : null;
  }

  async deleteParticipant(participantId: string): Promise<void> {
    await this.authFetcher.delete(`/participants/${participantId}`);
  }
}
