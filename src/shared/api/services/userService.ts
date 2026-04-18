import { apiClient } from '../client';
import {
  UserDTO,
  UserProfileCreateSchema,
  UserProfileUpdateSchema,
  StreakDTO,
} from '../types';

interface GetProfileParams {
  populate_city?: boolean;
  populate_direction?: boolean;
  populate_skills?: boolean;
}

export const userService = {
  async getProfile(params?: GetProfileParams): Promise<UserDTO> {
    const response = await apiClient.get<UserDTO>('/users/profile', { params });
    return response.data;
  },

  async createProfile(data: UserProfileCreateSchema): Promise<UserDTO> {
    // Longer timeout because profile creation involves multiple AI operations
    // (generating skills, salary estimates, and questions)
    const response = await apiClient.post<UserDTO>('/users/profile', data, {
      timeout: 120000, // 2 minutes
    });
    return response.data;
  },

  async updateProfile(data: UserProfileUpdateSchema): Promise<UserDTO> {
    const response = await apiClient.patch<UserDTO>('/users/profile', data);
    return response.data;
  },

  async getStreak(): Promise<StreakDTO> {
    const response = await apiClient.get<StreakDTO>('/users/profile/streak');
    return response.data;
  },

  async deleteUser(): Promise<void> {
    await apiClient.delete('/users');
  },
};
