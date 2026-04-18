import { apiClient } from '../client';
import { UserVacancyDTO, VacancyDTO, VacancySkillDTO } from '../types';

export const vacanciesService = {
  async getMyVacancies(params?: { populate_vacancy?: boolean }): Promise<UserVacancyDTO[]> {
    const response = await apiClient.get<UserVacancyDTO[]>('/vacancies/my', { params });
    return response.data;
  },

  async getVacancy(vacancyId: number, params?: {
    populate_skills?: boolean;
    populate_city?: boolean;
    populate_direction?: boolean;
  }): Promise<VacancyDTO> {
    const response = await apiClient.get<VacancyDTO>(`/vacancies/${vacancyId}`, { params });
    return response.data;
  },

  async getVacancySkills(vacancyId: number, params?: {
    populate_skill?: boolean;
  }): Promise<VacancySkillDTO[]> {
    const response = await apiClient.get<VacancySkillDTO[]>(`/vacancies/${vacancyId}/skills`, { params });
    return response.data;
  },
};
