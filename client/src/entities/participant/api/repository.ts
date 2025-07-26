import type { Fetcher } from "@/shared";
import type { Participant } from "../model/types";
import type { ParticipantRepository } from "./types";

export class ParticipantFetcherRepository implements ParticipantRepository {
  private fetcher: Fetcher;
  private authFetcher: Fetcher;

  constructor(fetcher: Fetcher, authFetcher: Fetcher) {
    this.fetcher = fetcher;
    this.authFetcher = authFetcher;
  }

  async getAllParticipants(divisionId: string): Promise<Participant[]> {
    const response = await this.fetcher.get<Participant[]>(`/divisions/${divisionId}/participants`);
    return response.data;
  }

  async getParticipantById(participantId: string): Promise<Participant | null> {
    const response = await this.fetcher.get<Participant>(`/participants/${participantId}`);
    return response.data ? response.data : null;
  }

  async createParticipant(
    divisionId: string,
    participant: Omit<Participant, "id" | "createdAt">,
  ): Promise<Participant> {
    const response = await this.authFetcher.post<Participant>(`/divisions/${divisionId}/participants`, {
      body: participant,
    });
    return response.data;
  }

  async updateParticipant(participantId: string, participant: Participant): Promise<Participant | null> {
    const response = await this.authFetcher.patch<Participant>(`/participants/${participantId}`, {
      body: participant,
    });
    return response.data ? response.data : null;
  }

  async deleteParticipant(participantId: string): Promise<void> {
    await this.authFetcher.delete(`/participants/${participantId}`);
  }
}
