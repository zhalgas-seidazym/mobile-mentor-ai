import { useMemo } from 'react';
import { useAuthStore } from '../stores';

export function useUserSkillIds(): Set<number> {
  const user = useAuthStore((state) => state.user);
  return useMemo(() => {
    const skills = user?.skills ?? [];
    return new Set(skills.map((s) => s.skill_id));
  }, [user?.skills]);
}
