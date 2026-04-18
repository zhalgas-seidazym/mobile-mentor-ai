import { apiClient } from '../client';
import {
  QuestionDTO,
  UserQuestionDTO,
  PaginatedResponse,
  PaginationParams,
} from '../types';

interface GetQuestionsBySkillParams extends PaginationParams {
  populate_skill?: boolean;
}

interface GetMyAnswersParams extends PaginationParams {
  module_id?: number;
  question_id?: number;
  populate_question?: boolean;
}

interface GetQuestionParams {
  populate_skill?: boolean;
}

export const questionsService = {
  async getQuestionsBySkill(
    skillId: number,
    params?: GetQuestionsBySkillParams
  ): Promise<PaginatedResponse<QuestionDTO>> {
    const response = await apiClient.get<PaginatedResponse<QuestionDTO>>(
      `/questions/module/${skillId}`,
      { params }
    );
    return response.data;
  },

  async getMyAnswers(params?: GetMyAnswersParams): Promise<PaginatedResponse<UserQuestionDTO>> {
    const response = await apiClient.get<PaginatedResponse<UserQuestionDTO>>(
      '/questions/user-answers',
      { params }
    );
    return response.data;
  },

  async getQuestion(questionId: number, params?: GetQuestionParams): Promise<QuestionDTO> {
    const response = await apiClient.get<QuestionDTO>(`/questions/${questionId}`, { params });
    return response.data;
  },
};
