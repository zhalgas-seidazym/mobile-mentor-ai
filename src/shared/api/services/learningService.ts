import { apiClient } from '../client';
import { LearningRecommendationDTO } from '../types';

export const learningService = {
  async getRecommendations(skillId: number): Promise<LearningRecommendationDTO> {
    const response = await apiClient.get<LearningRecommendationDTO>(
      `/learning-recommendations/ai/${skillId}`
    );
    return response.data;
  },
};
