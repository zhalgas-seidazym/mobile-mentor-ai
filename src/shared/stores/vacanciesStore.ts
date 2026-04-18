import { create } from 'zustand';
import { vacanciesService } from '../api/services';
import { UserVacancyDTO, VacancyDTO, VacancySkillDTO } from '../api/types';
import { getErrorMessage } from '../api/client';

interface VacanciesState {
  vacancies: UserVacancyDTO[];
  currentVacancy: VacancyDTO | null;
  currentVacancySkills: VacancySkillDTO[];
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
}

interface VacanciesActions {
  fetchVacancies: () => Promise<void>;
  fetchVacancyDetail: (vacancyId: number) => Promise<void>;
  fetchVacancySkills: (vacancyId: number) => Promise<void>;
  setCurrentVacancy: (vacancy: VacancyDTO | null) => void;
  clearError: () => void;
  reset: () => void;
}

type VacanciesStore = VacanciesState & VacanciesActions;

const initialState: VacanciesState = {
  vacancies: [],
  currentVacancy: null,
  currentVacancySkills: [],
  isLoading: false,
  isLoadingDetail: false,
  error: null,
};

export const useVacanciesStore = create<VacanciesStore>((set) => ({
  ...initialState,

  fetchVacancies: async () => {
    try {
      set({ isLoading: true, error: null });
      const vacancies = await vacanciesService.getMyVacancies({
        populate_vacancy: true,
      });
      set({ vacancies, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  fetchVacancyDetail: async (vacancyId: number) => {
    try {
      set({ isLoadingDetail: true, error: null, currentVacancySkills: [] });
      const vacancy = await vacanciesService.getVacancy(vacancyId, {
        populate_skills: true,
        populate_city: true,
        populate_direction: true,
      });
      set({ currentVacancy: vacancy, isLoadingDetail: false });
    } catch (error) {
      set({
        isLoadingDetail: false,
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  fetchVacancySkills: async (vacancyId: number) => {
    try {
      const skills = await vacanciesService.getVacancySkills(vacancyId, {
        populate_skill: true,
      });
      set({ currentVacancySkills: skills });
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  setCurrentVacancy: (vacancy: VacancyDTO | null) => {
    set({ currentVacancy: vacancy });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
