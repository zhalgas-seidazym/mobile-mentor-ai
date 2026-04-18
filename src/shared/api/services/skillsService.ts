import { apiClient } from '../client';
import {
  SkillDTO,
  UserSkillDTO,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface AutocompleteParams extends PaginationParams {
  q?: string;
}

interface GetMySkillsParams extends PaginationParams {
  populate_skill?: boolean;
}

export const skillsService = {
  async create(name: string): Promise<SkillDTO> {
    // API expects a plain JSON string, so we need to stringify it
    const response = await apiClient.post<SkillDTO>('/skills', JSON.stringify(name), {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async autocomplete(params?: AutocompleteParams): Promise<PaginatedResponse<SkillDTO>> {
    const response = await apiClient.get<PaginatedResponse<SkillDTO>>('/skills/autocomplete', {
      params,
    });
    return response.data;
  },

  async getMySkills(params?: GetMySkillsParams): Promise<PaginatedResponse<UserSkillDTO>> {
    const response = await apiClient.get<PaginatedResponse<UserSkillDTO>>('/skills/my', {
      params,
    });
    return response.data;
  },

  async getSkill(skillId: number): Promise<SkillDTO> {
    const response = await apiClient.get<SkillDTO>(`/skills/${skillId}`);
    return response.data;
  },
};
