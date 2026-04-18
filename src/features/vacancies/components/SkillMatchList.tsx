import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { VacancySkillDTO } from '@/src/shared/api/types';

interface SkillMatchListProps {
  vacancySkills: VacancySkillDTO[];
  userSkillIds: Set<number>;
}

export function SkillMatchList({ vacancySkills, userSkillIds }: SkillMatchListProps) {
  const theme = useAppTheme();

  const { matched, unmatched } = useMemo(() => {
    const matchedSkills: VacancySkillDTO[] = [];
    const unmatchedSkills: VacancySkillDTO[] = [];
    for (const vs of vacancySkills) {
      if (userSkillIds.has(vs.skill_id)) {
        matchedSkills.push(vs);
      } else {
        unmatchedSkills.push(vs);
      }
    }
    return { matched: matchedSkills, unmatched: unmatchedSkills };
  }, [vacancySkills, userSkillIds]);

  if (vacancySkills.length === 0) {
    return null;
  }

  return (
    <View>
      {matched.length > 0 && (
        <View style={{ marginBottom: theme.spacing.md }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your matching skills
            </Text>
          </View>
          {matched.map((vs) => (
            <View key={vs.skill_id} style={[styles.skillRow, { paddingVertical: theme.spacing.sm }]}>
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text variant="body" style={{ marginLeft: theme.spacing.sm }}>
                {vs.skill?.name ?? `Skill #${vs.skill_id}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {unmatched.length > 0 && (
        <View>
          <View style={styles.sectionHeader}>
            <Ionicons name="arrow-up-circle" size={18} color={theme.colors.gray[400]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Skills to develop
            </Text>
          </View>
          {unmatched.map((vs) => (
            <View key={vs.skill_id} style={[styles.skillRow, { paddingVertical: theme.spacing.sm }]}>
              <Ionicons name="close-circle" size={20} color={theme.colors.gray[400]} />
              <Text variant="body" color="secondary" style={{ marginLeft: theme.spacing.sm }}>
                {vs.skill?.name ?? `Skill #${vs.skill_id}`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
