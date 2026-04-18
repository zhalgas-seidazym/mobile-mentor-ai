import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AnswerStatus = 'correct' | 'incorrect' | 'partial' | 'unanswered';

interface ExpandableQuestionCardProps {
  questionNumber: number;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  feedback?: string;
  status: AnswerStatus;
}

export function ExpandableQuestionCard({
  questionNumber,
  question,
  correctAnswer,
  userAnswer,
  feedback,
  status,
}: ExpandableQuestionCardProps) {
  const theme = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  const isAnswered = status !== 'unanswered';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'correct':
        return {
          iconName: 'checkmark-circle' as const,
          iconColor: '#22C55E',
          bgColor: '#DCFCE7',
          borderColor: '#22C55E',
        };
      case 'incorrect':
        return {
          iconName: 'close-circle' as const,
          iconColor: '#EF4444',
          bgColor: '#FEE2E2',
          borderColor: '#EF4444',
        };
      case 'partial':
        return {
          iconName: 'alert-circle' as const,
          iconColor: '#F59E0B',
          bgColor: '#FEF3C7',
          borderColor: '#F59E0B',
        };
      default:
        return {
          iconName: 'help-circle-outline' as const,
          iconColor: theme.colors.gray[400],
          bgColor: theme.colors.gray[100],
          borderColor: theme.colors.border.default,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: isAnswered ? 2 : 1,
          borderColor: isAnswered ? statusConfig.borderColor : theme.colors.border.default,
        },
      ]}
    >
      {/* Header - always visible */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={styles.header}
      >
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Ionicons
            name={statusConfig.iconName}
            size={20}
            color={statusConfig.iconColor}
          />
        </View>

        <View style={styles.questionContent}>
          <Text
            style={[styles.questionNumber, { color: theme.colors.text.tertiary }]}
          >
            Question {questionNumber}
          </Text>
          <Text
            style={[styles.questionText, { color: theme.colors.text.primary }]}
            numberOfLines={expanded ? undefined : 2}
          >
            {question}
          </Text>
        </View>

        <View style={styles.chevronContainer}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={theme.colors.gray[400]}
          />
        </View>
      </TouchableOpacity>

      {/* Expandable content */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border.default }]}
          />

          {/* Correct Answer */}
          <View style={styles.answerSection}>
            <View style={styles.answerHeader}>
              <View
                style={[styles.answerIcon, { backgroundColor: '#DCFCE7' }]}
              >
                <Ionicons name="checkmark" size={14} color="#22C55E" />
              </View>
              <Text
                style={[styles.answerLabel, { color: '#22C55E' }]}
              >
                Correct Answer
              </Text>
            </View>
            <Text
              style={[styles.answerText, { color: theme.colors.text.primary }]}
            >
              {correctAnswer}
            </Text>
          </View>

          {/* User Answer - only if answered */}
          {isAnswered && userAnswer && (
            <>
              <View
                style={[styles.dividerSmall, { backgroundColor: theme.colors.border.default }]}
              />
              <View style={styles.answerSection}>
                <View style={styles.answerHeader}>
                  <View
                    style={[
                      styles.answerIcon,
                      {
                        backgroundColor:
                          status === 'correct'
                            ? '#DCFCE7'
                            : status === 'incorrect'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={14}
                      color={
                        status === 'correct'
                          ? '#22C55E'
                          : status === 'incorrect'
                          ? '#EF4444'
                          : '#F59E0B'
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.answerLabel,
                      {
                        color:
                          status === 'correct'
                            ? '#22C55E'
                            : status === 'incorrect'
                            ? '#EF4444'
                            : '#F59E0B',
                      },
                    ]}
                  >
                    Your Answer
                  </Text>
                </View>
                <Text
                  style={[styles.answerText, { color: theme.colors.text.primary }]}
                >
                  {userAnswer}
                </Text>
              </View>
            </>
          )}

          {/* Feedback - if available */}
          {feedback && (
            <>
              <View
                style={[styles.dividerSmall, { backgroundColor: theme.colors.border.default }]}
              />
              <View style={styles.answerSection}>
                <View style={styles.answerHeader}>
                  <View
                    style={[styles.answerIcon, { backgroundColor: theme.colors.primary[100] }]}
                  >
                    <Ionicons
                      name="bulb"
                      size={14}
                      color={theme.colors.primary[500]}
                    />
                  </View>
                  <Text
                    style={[styles.answerLabel, { color: theme.colors.primary[500] }]}
                  >
                    Feedback
                  </Text>
                </View>
                <Text
                  style={[styles.answerText, { color: theme.colors.text.secondary }]}
                >
                  {feedback}
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionContent: {
    flex: 1,
    paddingRight: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  chevronContainer: {
    marginTop: 8,
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  dividerSmall: {
    height: 1,
    marginVertical: 12,
  },
  answerSection: {},
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  answerLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  answerText: {
    fontSize: 14,
    lineHeight: 21,
    paddingLeft: 32,
  },
});
