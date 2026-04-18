import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { StatCard, MockInterviewCard, FireIcon, JobHeader } from '../components';
import { useAuthStore, useUserStore } from '@/src/shared/stores';

export function HomeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    streak,
    statistics,
    salary,
    fetchStreak,
    fetchStatistics,
    fetchSalary,
    isLoading,
  } = useUserStore();

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([
      fetchStreak().catch(() => {}),
      fetchStatistics().catch(() => {}),
      fetchSalary().catch(() => {}),
    ]);
  }, [fetchStreak, fetchStatistics, fetchSalary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMockInterviewPress = () => {
    router.push('/mock-interview');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const userName = user?.name || 'there';
  const currentStreak = streak?.current_streak ?? user?.current_streak ?? 0;
  const readinessPercentage = statistics?.readiness_percentage ?? 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: theme.spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
            colors={[theme.colors.primary[500]]}
          />
        }
      >
        {/* Greeting */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.greetingSection}
        >
          <Text style={[styles.greeting, { color: theme.colors.primary[500] }]}>
            {getGreeting()}, {userName}
          </Text>
        </Animated.View>

        {/* Stats Row - Now at top */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.statsSection}
        >
          {isLoading ? (
            <View style={[styles.statsRow, styles.loadingContainer]}>
              <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <StatCard
                title="Readiness"
                value={`${Math.round(readinessPercentage)}%`}
                progress={readinessPercentage}
                variant="readiness"
              />
              <StatCard
                title="Streak"
                value={currentStreak.toString()}
                subtitle="days"
                icon={<FireIcon size={36} />}
                variant="streak"
              />
            </View>
          )}
        </Animated.View>

        {/* Target Position - Now below stats */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.jobSection}
        >
          <JobHeader
            jobTitle={user?.direction?.name}
            jobDescription={user?.direction?.description}
            salary={salary ? { amount: salary.amount, currency: salary.currency } : undefined}
            showGreeting={false}
          />
        </Animated.View>

        {/* Today's Mock Interview */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.mockInterviewSection}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.primary[400] }]}>
            Today's mock interview
          </Text>
          <MockInterviewCard
            title="Mock interview"
            questionCount={statistics?.total_questions || 10}
            duration="30 min"
            type="Hard"
            onPress={handleMockInterviewPress}
          />
        </Animated.View>

        {/* Quick Stats */}
        {statistics && (
          <Animated.View
            entering={FadeInDown.delay(500).duration(400)}
            style={[styles.quickStats, { marginTop: theme.spacing.xl }]}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.primary[400] }]}>
              Your Progress
            </Text>
            <View
              style={[
                styles.statsCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.lg,
                },
              ]}
            >
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: theme.colors.primary[500] }}>
                  {statistics.met_questions}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  Questions Practiced
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: theme.colors.success?.light || '#22C55E' }}>
                  {statistics.correct_answers}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  Correct Answers
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h2" style={{ color: theme.colors.error?.light || '#EF4444' }}>
                  {statistics.incorrect_answers}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  Need Practice
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={{ height: theme.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statsSection: {},
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  jobSection: {
    marginBottom: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  mockInterviewSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickStats: {},
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
});
