import type { Competition, CompetitionForm, CompetitionRepository } from "@/entities/competition";
import type { AdminCompetitionService } from "./types";

interface AdminCompetitionServiceProps {
  competitionRepository: CompetitionRepository;
}

export const createAdminCompetitionService = ({
  competitionRepository,
}: AdminCompetitionServiceProps): AdminCompetitionService => {
  const getAllCompetitions = async (): Promise<Competition[]> => {
    try {
      return await competitionRepository.getAllCompetitions();
    } catch (error) {
      console.error("Failed to get all competitions:", error);
      throw error;
    }
  };

  const getCompetitionById = async (id: string): Promise<Competition | null> => {
    try {
      return await competitionRepository.getCompetitionById(id);
    } catch (error) {
      console.error(`Failed to get competition by id ${id}:`, error);
      throw error;
    }
  };

  const createCompetition = async (data: CompetitionForm): Promise<Competition> => {
    try {
      return await competitionRepository.createCompetition(data);
    } catch (error) {
      console.error("Failed to create competition:", error);
      throw error;
    }
  };

  const updateCompetition = async (id: string, data: CompetitionForm): Promise<Competition> => {
    try {
      const existingCompetition = await competitionRepository.getCompetitionById(id);
      if (!existingCompetition) {
        throw new Error(`Competition with id ${id} not found`);
      }

      const updatedCompetition = {
        ...existingCompetition,
        ...data,
      };

      return await competitionRepository.updateCompetition(updatedCompetition);
    } catch (error) {
      console.error(`Failed to update competition ${id}:`, error);
      throw error;
    }
  };

  const deleteCompetition = async (id: string): Promise<void> => {
    try {
      await competitionRepository.deleteCompetition(id);
    } catch (error) {
      console.error(`Failed to delete competition ${id}:`, error);
      throw error;
    }
  };

  return {
    getAllCompetitions,
    getCompetitionById,
    createCompetition,
    updateCompetition,
    deleteCompetition,
  };
};