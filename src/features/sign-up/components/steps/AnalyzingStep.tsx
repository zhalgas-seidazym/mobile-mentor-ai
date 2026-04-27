import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { Button, Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { useSignUp } from '../../context/SignUpContext';
import { StepContainer } from '../layout/StepContainer';
import { AnalyzingIllustration } from '../ui/AnalyzingIllustration';
import { useUserStore, useAuthStore } from '@/src/shared/stores';
import { skillsService } from '@/src/shared/api/services';
import { getErrorMessage } from '@/src/shared/api/client';

const LOADING_MESSAGES = [
  'Analyzing your skills...',
  'Finding the best career path...',
  'Customizing your learning plan...',
  'Preparing your dashboard...',
  'Almost ready...',
];

export function AnalyzingStep() {
  const theme = useAppTheme();
  const router = useRouter();
  const { state, startAnalyzing, completeAnalyzing, goBack, stepNumber, totalSteps } = useSignUp();
  const { createProfile, fetchProfile } = useUserStore();
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (!state.analysisComplete && !error) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [state.analysisComplete, error]);

  useEffect(() => {
    createUserProfile();
  }, []);

  const createUserProfile = async () => {
    if (isCreating) return;

    setIsCreating(true);
    startAnalyzing();
    setError(null);

    try {
      if (!state.cityId) {
        throw new Error('City not found. Please go back and select a valid city.');
      }

      if (!state.targetJob) {
        throw new Error('Target job not found. Please go back and select a target job.');
      }

      const directionId = parseInt(state.targetJob.id, 10);

      // Get or create skill IDs
      const skillIds: number[] = [];
      for (const skillName of state.selectedSkills) {
        const skill = await skillsService.getOrCreateByName(skillName);
        skillIds.push(skill.id);
      }

      await createProfile({
        name: state.name,
        city_id: state.cityId,
        direction_id: directionId,
        skill_ids: skillIds,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      await fetchProfile();
      await useAuthStore.getState().initialize();

      completeAnalyzing();
    } catch (err) {
      setError(getErrorMessage(err));
      completeAnalyzing();
    } finally {
      setIsCreating(false);
    }
  };

  const handleLetsGo = () => {
    router.replace('/(tabs)');
  };

  const handleRetry = () => {
    setError(null);
    setLoadingMessageIndex(0);
    createUserProfile();
  };

  return (
    <StepContainer
      currentStep={stepNumber}
      totalSteps={totalSteps}
      onBack={goBack}
      showHeader={!state.analysisComplete}
      footer={
        state.analysisComplete ? (
          error ? (
            <Button onPress={handleRetry} variant="primary" size="lg">
              Retry
            </Button>
          ) : (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <Button onPress={handleLetsGo} variant="primary" size="lg">
                Let's go
              </Button>
            </Animated.View>
          )
        ) : undefined
      }
    >
      <View style={styles.content}>
        <View style={styles.centered}>
          {/* Progress dots */}
          {!state.analysisComplete && (
            <View style={[styles.progressDots, { marginBottom: theme.spacing.xxl }]}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i <= loadingMessageIndex 
                        ? theme.colors.primary[500] 
                        : theme.colors.border.default,
                      marginHorizontal: 4,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Illustration - centered */}
          <View style={styles.illustrationWrapper}>
            <AnalyzingIllustration 
              size={200} 
              isComplete={state.analysisComplete && !error} 
            />
          </View>

          {/* Status messages */}
          <View style={styles.messageContainer}>
            {error ? (
              <Animated.View entering={FadeIn.duration(300)}>
                <Text 
                  variant="h3" 
                  align="center" 
                  style={{ color: theme.colors.error?.light || '#EF4444' }}
                >
                  Setup Failed
                </Text>
                <Text
                  variant="body"
                  align="center"
                  color="secondary"
                  style={{ marginTop: theme.spacing.md }}
                >
                  {error}
                </Text>
              </Animated.View>
            ) : state.analysisComplete ? (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Text variant="h2" align="center" style={{ color: theme.colors.primary[500] }}>
                  You're all set!
                </Text>
                <Text
                  variant="body"
                  align="center"
                  color="secondary"
                  style={{ marginTop: theme.spacing.sm }}
                >
                  Your personalized learning path is ready
                </Text>
              </Animated.View>
            ) : (
              <Animated.View 
                key={loadingMessageIndex}
                entering={FadeIn.duration(400)}
                exiting={FadeOut.duration(200)}
              >
                <Text variant="body" align="center" color="secondary">
                  {LOADING_MESSAGES[loadingMessageIndex]}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Summary when complete */}
          {state.analysisComplete && !error && (
            <Animated.View 
              entering={FadeInDown.delay(200).duration(400)}
              style={[
                styles.summaryCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.borderRadius.lg,
                  marginTop: theme.spacing.xl,
                  padding: theme.spacing.lg,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text variant="bodySmall" color="secondary">Target Role</Text>
                <Text variant="body" weight="semibold">{state.targetJob?.title}</Text>
              </View>
              <View style={[styles.summaryRow, { marginTop: theme.spacing.sm }]}>
                <Text variant="bodySmall" color="secondary">Location</Text>
                <Text variant="body" weight="semibold">{state.city}, {state.country}</Text>
              </View>
              {state.selectedSkills.length > 0 && (
                <View style={[styles.summaryRow, { marginTop: theme.spacing.sm }]}>
                  <Text variant="bodySmall" color="secondary">Skills</Text>
                  <Text variant="body" weight="semibold">
                    {state.selectedSkills.length} selected
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  messageContainer: {
    alignItems: 'center',
    minHeight: 60,
  },
  summaryCard: {
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
