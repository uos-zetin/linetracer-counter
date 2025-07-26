import type { Fetcher } from "@/shared";
import type { Participant } from "../model/types";
import type { ParticipantDto, ParticipantRepository } from "./types";
import { parseParticipantDto } from "../lib/parse-dto";

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

  async getParticipantById(participantId: string): Promise<Participant | null> {
    const response = await this.fetcher.get<ParticipantDto>(`/participants/${participantId}`);
    return response.data ? parseParticipantDto(response.data) : null;
  }

  async createParticipant(
    divisionId: string,
    participant: Omit<Participant, "id" | "createdAt">,
  ): Promise<Participant> {
    const response = await this.authFetcher.post<ParticipantDto>(`/divisions/${divisionId}/participants`, {
      body: participant,
    });
    return parseParticipantDto(response.data);
  }

  async updateParticipant(participantId: string, participant: Participant): Promise<Participant | null> {
    const response = await this.authFetcher.patch<ParticipantDto>(`/participants/${participantId}`, {
      body: participant,
    });
    return response.data ? parseParticipantDto(response.data) : null;
  }

  async deleteParticipant(participantId: string): Promise<void> {
    await this.authFetcher.delete(`/participants/${participantId}`);
  }
}
