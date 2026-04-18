import React, { useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { ModuleCard } from '../components/ModuleCard';
import { useModulesStore } from '@/src/shared/stores';
import { UserSkillDTO } from '@/src/shared/api/types';

export function ModulesListScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { modules, isLoading, error, fetchModules, setCurrentModule } = useModulesStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchModules().catch(() => {});
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchModules();
    } finally {
      setRefreshing(false);
    }
  };

  const handleModulePress = (module: UserSkillDTO) => {
    setCurrentModule(module);
    router.push(`/module/${module.skill_id}`);
  };

  // Calculate overall progress
  const { completedCount, totalCount, overallProgress } = useMemo(() => {
    const completed = modules.filter((m) => !m.to_learn).length;
    const total = modules.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { completedCount: completed, totalCount: total, overallProgress: progress };
  }, [modules]);

  if (isLoading && modules.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.md }}>
            Loading your roadmap...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && modules.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.gray[300]} />
          <Text variant="h3" color="secondary" align="center" style={{ marginTop: theme.spacing.md }}>
            Could not load modules
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.sm }}>
            {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (modules.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
          <Text variant="h1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
            My Roadmap
          </Text>
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Ionicons name="map-outline" size={32} color={theme.colors.primary[500]} />
            </View>
            <Text variant="h3" color="secondary" align="center" style={{ marginTop: theme.spacing.lg }}>
              No modules yet
            </Text>
            <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing.sm }}>
              Complete your profile setup to get personalized learning modules
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <FlatList
        data={modules}
        keyExtractor={(item) => `${item.user_id}-${item.skill_id}`}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            {/* Title */}
            <Text variant="h1" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.lg }}>
              My Roadmap
            </Text>

            {/* Progress Overview Card */}
            <LinearGradient
              colors={[theme.colors.primary[500], theme.colors.primary[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressCard}
            >
              <View style={styles.progressCardContent}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressTitle}>Your Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {completedCount} of {totalCount} modules completed
                  </Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressPercent}>
                    {Math.round(overallProgress)}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${overallProgress}%` },
                    ]}
                  />
                </View>
              </View>

              {overallProgress === 100 && (
                <View style={styles.completedBanner}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.completedBannerText}>
                    All modules completed!
                  </Text>
                </View>
              )}
            </LinearGradient>

            {/* Modules List Header */}
            <View style={styles.modulesHeader}>
              <Text variant="label" color="secondary">
                Modules
              </Text>
              <Text variant="bodySmall" color="secondary">
                {totalCount} skills
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
            {/* Connection Line */}
            {index > 0 && (
              <View style={styles.connectionLine}>
                <View
                  style={[
                    styles.connectionLineDot,
                    {
                      backgroundColor: !modules[index - 1].to_learn
                        ? '#22C55E'
                        : theme.colors.gray[300],
                    },
                  ]}
                />
                <View
                  style={[
                    styles.connectionLineBar,
                    {
                      backgroundColor: !modules[index - 1].to_learn
                        ? '#22C55E'
                        : theme.colors.gray[200],
                    },
                  ]}
                />
              </View>
            )}
            <ModuleCard
              id={item.skill_id.toString()}
              title={item.skill?.name || `Skill ${item.skill_id}`}
              metadata={!item.to_learn ? 'Completed' : 'In Progress'}
              description={
                item.match_percentage !== undefined
                  ? `${Math.round(item.match_percentage)}% match with your target job`
                  : 'Practice this skill to improve your interview performance'
              }
              completed={!item.to_learn}
              progress={item.match_percentage || 0}
              onPress={() => handleModulePress(item)}
            />
          </View>
        )}
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
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#7C6AFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  progressCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressInfo: {},
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    gap: 8,
  },
  completedBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionLine: {
    alignItems: 'center',
    height: 24,
    marginBottom: 8,
  },
  connectionLineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionLineBar: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
});
