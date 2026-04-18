import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { VacancyCard } from '../components/VacancyCard';
import { useVacanciesStore } from '@/src/shared/stores';
import { UserVacancyDTO } from '@/src/shared/api/types';
import { useUserSkillIds } from '@/src/shared/hooks/useUserSkillIds';

export function VacanciesListScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { vacancies, isLoading, error, fetchVacancies, setCurrentVacancy } = useVacanciesStore();
  const userSkillIds = useUserSkillIds();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchVacancies().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVacancies();
    } finally {
      setRefreshing(false);
    }
  };

  const handleVacancyPress = (item: UserVacancyDTO) => {
    if (item.vacancy) {
      setCurrentVacancy(item.vacancy);
    }
    router.push(`/vacancy/${item.vacancy_id}`);
  };

  if (isLoading && vacancies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
            Loading your vacancies...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && vacancies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.gray[300]} />
          <Text variant="h3" color="secondary" align="center" style={{ marginTop: theme.spacing.md }}>
            Could not load vacancies
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.sm }}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (vacancies.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
          <Text variant="h1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
            My Vacancies
          </Text>
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Ionicons name="briefcase-outline" size={32} color={theme.colors.primary[500]} />
            </View>
            <Text variant="h3" color="secondary" align="center" style={{ marginTop: theme.spacing.lg }}>
              No vacancies yet
            </Text>
            <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.sm }}>
              Vacancies matching your profile will appear here
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        data={vacancies}
        keyExtractor={(item) => `${item.user_id}-${item.vacancy_id}`}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <Text variant="h1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
              My Vacancies
            </Text>
            <View style={styles.listHeader}>
              <Text variant="label" color="secondary">
                Vacancies
              </Text>
              <Text variant="bodySmall" color="secondary">
                {vacancies.length} found
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          if (!item.vacancy) return null;
          return (
            <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
              <VacancyCard
                vacancy={item.vacancy}
                userSkillIds={userSkillIds}
                onPress={() => handleVacancyPress(item)}
              />
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
