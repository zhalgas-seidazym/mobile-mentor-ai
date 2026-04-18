import { apiClient } from '../client';
import {
  DirectionDTO,
  SalaryDTO,
  ProgressStatisticsDTO,
  PaginatedResponse,
  PaginationParams,
  AIDirectionsRequest,
} from '../types';

interface AutocompleteParams extends PaginationParams {
  q?: string;
}

export const directionsService = {
  async create(name: string): Promise<DirectionDTO> {
    // API expects a plain JSON string, so we need to stringify it
    const response = await apiClient.post<DirectionDTO>('/directions', JSON.stringify(name), {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  async getAIDirections(data: AIDirectionsRequest): Promise<SalaryDTO[]> {
    // Longer timeout because AI analysis can take time
    const response = await apiClient.post<SalaryDTO[]>('/directions/ai-directions', data, {
      timeout: 60000, // 1 minute
    });
    return response.data;
  },

  async autocomplete(params?: AutocompleteParams): Promise<PaginatedResponse<DirectionDTO>> {
    const response = await apiClient.get<PaginatedResponse<DirectionDTO>>(
      '/directions/autocomplete',
      { params }
    );
    return response.data;
  },

  async getMySalary(): Promise<SalaryDTO> {
    const response = await apiClient.get<SalaryDTO>('/directions/salary/my');
    return response.data;
  },

  async getDirection(directionId: number): Promise<DirectionDTO> {
    const response = await apiClient.get<DirectionDTO>(`/directions/${directionId}`);
    return response.data;
  },

  async getMyStatistics(): Promise<ProgressStatisticsDTO> {
    const response = await apiClient.get<ProgressStatisticsDTO>('/directions/my/statistics');
    return response.data;
  },
};
