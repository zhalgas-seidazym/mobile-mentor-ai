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
    const response = await apiClient.post<SkillDTO>('/skills', JSON.stringify(name.trim()), {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async getOrCreateByName(name: string): Promise<SkillDTO> {
    const normalizedName = name.trim();
    const response = await this.autocomplete({ q: normalizedName, per_page: 30 });
    const exactMatch = response.items.find(
      (skill) => skill.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch;
    }

    return this.create(normalizedName);
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
