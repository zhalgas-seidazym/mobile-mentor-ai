import React, { useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { SkillMatchSummary } from '../components/SkillMatchSummary';
import { SkillMatchList } from '../components/SkillMatchList';
import { useVacanciesStore } from '@/src/shared/stores';
import { useUserSkillIds } from '@/src/shared/hooks/useUserSkillIds';
import { computeSkillMatch } from '@/src/shared/utils/skillMatch';

export function VacancyDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vacancyId = parseInt(id || '0', 10);

  const {
    currentVacancy,
    currentVacancySkills,
    isLoadingDetail,
    fetchVacancyDetail,
    fetchVacancySkills,
    setCurrentVacancy,
  } = useVacanciesStore();

  const userSkillIds = useUserSkillIds();

  useEffect(() => {
    if (vacancyId) {
      setCurrentVacancy(null);
      fetchVacancyDetail(vacancyId).catch(() => {});
      fetchVacancySkills(vacancyId).catch(() => {});
    }
  }, [vacancyId]);

  const { matchedCount, totalCount } = useMemo(
    () => computeSkillMatch(currentVacancySkills, userSkillIds),
    [currentVacancySkills, userSkillIds],
  );

  if (isLoadingDetail && !currentVacancy) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
            Loading vacancy...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const vacancy = currentVacancy;
  const isOnline = vacancy?.vacancy_type === 'online';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
      >
        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          {/* Title + Type badge */}
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <Text variant="h1" style={{ marginBottom: 4 }}>
                {vacancy?.title ?? 'Vacancy'}
              </Text>
            </View>
            {vacancy?.vacancy_type && (
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)' },
                ]}
              >
                <Text
                  style={[
                    styles.typeBadgeText,
                    { color: isOnline ? '#22C55E' : '#3B82F6' },
                  ]}
                >
                  {vacancy.vacancy_type}
                </Text>
              </View>
            )}
          </View>

          {/* Info chips */}
          <View style={[styles.chipsRow, { marginTop: theme.spacing.md }]}>
            {vacancy?.city?.name && (
              <View style={[styles.chip, { backgroundColor: theme.colors.gray[100] }]}>
                <Ionicons name="location-outline" size={16} color={theme.colors.text.secondary} />
                <Text variant="bodySmall" color="secondary" style={{ marginLeft: 4 }}>
                  {vacancy.city.name}
                </Text>
              </View>
            )}
            {vacancy?.direction?.name && (
              <View style={[styles.chip, { backgroundColor: theme.colors.gray[100] }]}>
                <Ionicons name="compass-outline" size={16} color={theme.colors.text.secondary} />
                <Text variant="bodySmall" color="secondary" style={{ marginLeft: 4 }}>
                  {vacancy.direction.name}
                </Text>
              </View>
            )}
          </View>

          {/* Salary */}
          {vacancy?.salary_amount != null && (
            <View style={[styles.salaryRow, { marginTop: theme.spacing.lg }]}>
              <Ionicons name="cash-outline" size={22} color={theme.colors.primary[500]} />
              <Text style={[styles.salaryText, { color: theme.colors.text.primary, marginLeft: theme.spacing.sm }]}>
                {vacancy.salary_amount.toLocaleString()} {vacancy.salary_currency}
              </Text>
            </View>
          )}

          {/* Skill Match Summary */}
          <View style={{ marginTop: theme.spacing.lg }}>
            <SkillMatchSummary
              matchedCount={matchedCount}
              totalCount={totalCount}
            />
          </View>

          {/* Skill Match List */}
          <View style={{ marginTop: theme.spacing.lg }}>
            <SkillMatchList
              vacancySkills={currentVacancySkills}
              userSkillIds={userSkillIds}
            />
          </View>

          {/* Apply button */}
          {vacancy?.url && (
            <View style={{ marginTop: theme.spacing.xl }}>
              <Button onPress={() => Linking.openURL(vacancy.url).catch(() => {})}>
                Apply Now
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButton: {
    marginLeft: -8,
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleContent: {
    flex: 1,
    marginRight: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salaryText: {
    fontSize: 20,
    fontWeight: '700',
  },
});
