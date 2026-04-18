import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { ExpandableQuestionCard } from '../components/ExpandableQuestionCard';
import { useModulesStore } from '@/src/shared/stores';

export function ModuleDetailScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    currentModule,
    questions,
    statistics,
    isLoadingQuestions,
    fetchModuleQuestions,
    fetchModuleStatistics,
    fetchUserAnswers,
    userAnswers,
  } = useModulesStore();

  const skillId = parseInt(id || '0', 10);

  useEffect(() => {
    if (skillId) {
      fetchModuleQuestions(skillId).catch(() => {});
      fetchModuleStatistics(skillId).catch(() => {});
      fetchUserAnswers(skillId).catch(() => {});
    }
  }, [skillId]);

  const moduleName = currentModule?.skill?.name || `Module ${skillId}`;

  const getAnswerForQuestion = (questionId: number) => {
    return userAnswers.find((a) => a.question_id === questionId);
  };

  // Calculate progress
  const answeredCount = questions.filter((q) => getAnswerForQuestion(q.id)).length;
  const progressPercentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const isCompleted = progressPercentage === 100;

  if (isLoadingQuestions && questions.length === 0) {
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
            Loading questions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <>
            {/* Module Title & Status */}
            <View style={{ paddingHorizontal: theme.spacing.lg }}>
              <View style={styles.titleRow}>
                <View style={styles.titleContent}>
                  <Text variant="h1" style={{ marginBottom: 4 }}>
                    {moduleName}
                  </Text>
                  <Text variant="bodySmall" color="secondary">
                    {questions.length} questions
                  </Text>
                </View>
                {isCompleted && (
                  <View
                    style={[
                      styles.completedBadge,
                      { backgroundColor: '#DCFCE7' },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
              </View>

              {/* Progress Bar */}
              <View style={[styles.progressSection, { marginTop: theme.spacing.lg }]}>
                <View style={styles.progressHeader}>
                  <Text variant="label" color="secondary">
                    Progress
                  </Text>
                  <Text
                    style={[
                      styles.progressPercent,
                      { color: isCompleted ? '#22C55E' : theme.colors.primary[500] },
                    ]}
                  >
                    {Math.round(progressPercentage)}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: theme.colors.gray[200] },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progressPercentage}%`,
                        backgroundColor: isCompleted ? '#22C55E' : theme.colors.primary[500],
                      },
                    ]}
                  />
                </View>
                <Text
                  variant="bodySmall"
                  color="secondary"
                  style={{ marginTop: 6 }}
                >
                  {answeredCount} of {questions.length} questions answered
                </Text>
              </View>

              {/* Statistics Cards */}
              {statistics && (
                <View style={[styles.statsRow, { marginTop: theme.spacing.lg }]}>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: '#DCFCE7' },
                    ]}
                  >
                    <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                    <Text style={[styles.statNumber, { color: '#22C55E' }]}>
                      {statistics.correct_answers}
                    </Text>
                    <Text style={[styles.statLabel, { color: '#16A34A' }]}>
                      Correct
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: '#FEE2E2' },
                    ]}
                  >
                    <Ionicons name="close-circle" size={22} color="#EF4444" />
                    <Text style={[styles.statNumber, { color: '#EF4444' }]}>
                      {statistics.incorrect_answers}
                    </Text>
                    <Text style={[styles.statLabel, { color: '#DC2626' }]}>
                      Incorrect
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statCard,
                      { backgroundColor: theme.colors.primary[100] },
                    ]}
                  >
                    <Ionicons
                      name="trending-up"
                      size={22}
                      color={theme.colors.primary[500]}
                    />
                    <Text
                      style={[styles.statNumber, { color: theme.colors.primary[500] }]}
                    >
                      {Math.round(statistics.readiness_percentage)}%
                    </Text>
                    <Text
                      style={[styles.statLabel, { color: theme.colors.primary[600] }]}
                    >
                      Ready
                    </Text>
                  </View>
                </View>
              )}

              {/* Questions Header */}
              <Text
                variant="label"
                color="secondary"
                style={{ marginTop: theme.spacing.xl, marginBottom: theme.spacing.md }}
              >
                Questions
              </Text>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const answer = getAnswerForQuestion(item.id);
          return (
            <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
              <ExpandableQuestionCard
                questionNumber={index + 1}
                question={item.question}
                correctAnswer={item.ideal_answer}
                userAnswer={answer?.user_answer}
                feedback={answer?.feedback}
                status={answer?.status || 'unanswered'}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { paddingHorizontal: theme.spacing.lg }]}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={theme.colors.gray[300]}
            />
            <Text
              variant="body"
              color="secondary"
              align="center"
              style={{ marginTop: theme.spacing.md }}
            >
              No questions available for this module yet.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: theme.spacing.xxl }}
      />
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
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22C55E',
  },
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});
