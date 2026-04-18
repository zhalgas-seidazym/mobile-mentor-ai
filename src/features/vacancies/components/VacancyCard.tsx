import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { VacancyDTO } from '@/src/shared/api/types';
import { computeSkillMatch, getMatchColor } from '@/src/shared/utils/skillMatch';

interface VacancyCardProps {
  vacancy: VacancyDTO;
  userSkillIds: Set<number>;
  onPress: () => void;
}

export function VacancyCard({ vacancy, userSkillIds, onPress }: VacancyCardProps) {
  const theme = useAppTheme();

  const { totalCount, matchPercentage } = useMemo(
    () => computeSkillMatch(vacancy.vacancy_skills ?? [], userSkillIds),
    [vacancy.vacancy_skills, userSkillIds],
  );

  const matchColor = getMatchColor(matchPercentage);

  const isOnline = vacancy.vacancy_type === 'online';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.colors.border.default,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.icon,
            { backgroundColor: theme.colors.gray[100] },
          ]}
        >
          <Ionicons name="briefcase-outline" size={22} color={theme.colors.gray[500]} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={2}>
            {vacancy.title}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
      </View>

      {/* Info row */}
      <View style={styles.infoRow}>
        {vacancy.city && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color={theme.colors.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {vacancy.city.name}
            </Text>
          </View>
        )}
        {vacancy.direction && (
          <View style={styles.infoItem}>
            <Ionicons name="compass-outline" size={14} color={theme.colors.text.tertiary} />
            <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
              {vacancy.direction.name}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isOnline ? '#22C55E' : '#3B82F6' },
            ]}
          >
            {vacancy.vacancy_type}
          </Text>
        </View>
      </View>

      {/* Salary */}
      {vacancy.salary_amount > 0 && (
        <Text style={[styles.salary, { color: theme.colors.text.primary }]}>
          {vacancy.salary_amount.toLocaleString()} {vacancy.salary_currency}
        </Text>
      )}

      {/* Skill match */}
      {totalCount > 0 && (
        <View style={styles.matchContainer}>
          <View style={[styles.matchBar, { backgroundColor: theme.colors.gray[200] }]}>
            <View
              style={[
                styles.matchBarFill,
                { width: `${matchPercentage}%`, backgroundColor: matchColor },
              ]}
            />
          </View>
          <Text style={[styles.matchText, { color: matchColor }]}>
            {matchPercentage}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  salary: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  matchBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  matchBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});
