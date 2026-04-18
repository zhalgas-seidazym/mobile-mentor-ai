import { apiClient } from '../client';
import {
  UserSkillDTO,
  ProgressStatisticsDTO,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface GetModulesParams extends PaginationParams {
  populate_skill?: boolean;
}

export const modulesService = {
  async getMyModules(params?: GetModulesParams): Promise<PaginatedResponse<UserSkillDTO>> {
    const response = await apiClient.get<PaginatedResponse<UserSkillDTO>>('/modules/my', {
      params,
    });
    return response.data;
  },

  async getModuleStatistics(moduleId: number): Promise<ProgressStatisticsDTO> {
    const response = await apiClient.get<ProgressStatisticsDTO>(
      `/modules/${moduleId}/statistics`
    );
    return response.data;
  },
};
