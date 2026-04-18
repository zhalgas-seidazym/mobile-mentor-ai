// ============ Auth Types ============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  code: string;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  code: string;
}

export interface PasswordResetRequest {
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface RegisterResponse extends TokenResponse {
  user_id: number;
}

export interface PasswordResetTokenResponse {
  password_reset_token: string;
}

// ============ User Types ============
export interface UserDTO {
  id: number;
  email: string;
  name?: string;
  city_id?: number;
  direction_id?: number;
  is_onboarding_completed: boolean;
  current_streak: number;
  longest_streak: number;
  last_interview_day?: string;
  timezone?: string;
  skills?: UserSkillDTO[];
  modules?: UserSkillDTO[];
  direction?: DirectionDTO;
  city?: CityDTO;
  created_at: string;
  updated_at: string;
}

export interface UserProfileCreateSchema {
  name: string;
  city_id: number;
  direction_id: number;
  skill_ids: number[];
  timezone?: string;
}

export interface UserProfileUpdateSchema {
  password?: string;
  new_password?: string;
  name?: string;
  city_id?: number;
  direction_id?: number;
  skill_ids?: number[];
  timezone?: string;
}

export interface StreakDTO {
  current_streak: number;
  longest_streak: number;
  last_interview_day?: string;
  timezone?: string;
}

// ============ Skill Types ============
export interface SkillDTO {
  id: number;
  name: string;
}

export interface UserSkillDTO {
  user_id: number;
  skill_id: number;
  skill?: SkillDTO;
  to_learn: boolean;
  match_percentage?: number;
}

// ============ Location Types ============
export interface CountryDTO {
  id: number;
  name: string;
}

export interface CityDTO {
  id: number;
  name: string;
  country_id: number;
  country?: CountryDTO;
}

// ============ Direction Types ============
export interface DirectionDTO {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SalaryDTO {
  id: number;
  direction_id: number;
  city_id: number;
  amount: number;
  currency: string;
  direction?: DirectionDTO;
  city?: CityDTO;
  created_at: string;
  updated_at: string;
}

export interface AIDirectionsRequest {
  city_id: number;
  skills?: string[];
}

// ============ Progress Types ============
export interface ProgressStatisticsDTO {
  total_questions: number;
  met_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  readiness_percentage: number;
}

// ============ Question Types ============
export interface QuestionDTO {
  id: number;
  question: string;
  ideal_answer: string;
  skill_id: number;
  skill?: SkillDTO;
}

export interface UserQuestionDTO {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  feedback?: string;
  status: 'correct' | 'incorrect' | 'partial';
  interview_question_id?: number;
  question?: QuestionDTO;
}

// ============ Interview Types ============
export interface InterviewQuestion {
  interview_question_id: number;
  question_id?: number; // Only for main questions
  text: string;
}

export interface InterviewStartResponse {
  session_id: number;
  main_question_index: number;
  total_main_questions: number;
  question: InterviewQuestion;
  followup_limit: number;
}

export interface InterviewSession {
  session_id: number;
  status: 'active' | 'completed' | 'abandoned';
  current_main_index: number;
  total_main_questions: number;
  current_interview_question_id?: number;
}

export type InterviewAnswerStatus = 'need_followup' | 'final' | 'completed';

export interface InterviewAnswerResponse {
  status: InterviewAnswerStatus;
  feedback?: string;
  user_answer_text?: string; // User's transcribed speech
  // For need_followup status
  followup_question?: InterviewQuestion;
  followup_count?: number;
  followup_limit?: number;
  // For final status
  result?: 'satisfactory' | 'unsatisfactory';
  next_question?: InterviewQuestion;
  main_question_index?: number;
  total_main_questions?: number;
  // For completed status
  current_streak?: number;
  longest_streak?: number;
  last_interview_day?: string;
}

// ============ Learning Types ============
export interface LearningRecommendationDTO {
  skill_id: number;
  sources: string[];
}

// ============ Pagination Types ============
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ============ API Error Types ============
export interface APIError {
  detail: string | { msg: string; type: string }[];
}

// ============ Vacancy Types ============
export interface VacancySkillDTO {
  vacancy_id: number;
  skill_id: number;
  skill?: SkillDTO;
}

export interface VacancyDTO {
  id: number;
  title: string;
  direction_id: number;
  city_id: number;
  salary_amount: number;
  salary_currency: string;
  vacancy_type: 'online' | 'offline';
  url: string;
  created_at: string;
  updated_at: string;
  vacancy_skills?: VacancySkillDTO[];
  city?: CityDTO;
  direction?: DirectionDTO;
}

export interface UserVacancyDTO {
  user_id: number;
  vacancy_id: number;
  vacancy?: VacancyDTO;
}
