import { VacancySkillDTO } from '../api/types';

export interface SkillMatchResult {
  matchedCount: number;
  totalCount: number;
  matchPercentage: number;
}

export function computeSkillMatch(
  vacancySkills: VacancySkillDTO[],
  userSkillIds: Set<number>,
): SkillMatchResult {
  const totalCount = vacancySkills.length;
  const matchedCount = vacancySkills.filter((vs) => userSkillIds.has(vs.skill_id)).length;
  const matchPercentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;
  return { matchedCount, totalCount, matchPercentage };
}

export function getMatchColor(percentage: number): string {
  if (percentage >= 75) return '#22C55E';
  if (percentage >= 40) return '#F59E0B';
  return '#EF4444';
}

export function getMatchGradient(percentage: number): { gradient: [string, string]; label: string } {
  if (percentage >= 75) {
    return { gradient: ['#22C55E', '#16A34A'], label: 'Great match!' };
  }
  if (percentage >= 40) {
    return { gradient: ['#F59E0B', '#D97706'], label: 'Partial match' };
  }
  return { gradient: ['#EF4444', '#DC2626'], label: 'Skills gap' };
}
