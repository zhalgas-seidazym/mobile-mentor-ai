import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';

interface JobHeaderProps {
  greeting?: string;
  userName?: string;
  jobTitle?: string;
  jobDescription?: string;
  salary?: {
    amount: number;
    currency: string;
  };
  showGreeting?: boolean;
}

function formatSalary(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  });

  try {
    return `${formatter.format(amount)}/month`;
  } catch {
    return `$${amount.toLocaleString()}/month`;
  }
}

export function JobHeader({
  greeting,
  userName,
  jobTitle,
  jobDescription,
  salary,
  showGreeting = true,
}: JobHeaderProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Greeting */}
      {showGreeting && greeting && userName && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={[styles.greeting, { color: theme.colors.primary[500] }]}>
            {greeting}, {userName}
          </Text>
        </Animated.View>
      )}

      {/* Job Info Card */}
      {jobTitle && (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[
            styles.jobCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border.default,
            },
          ]}
        >
          {/* Target Badge */}
          <View style={styles.targetBadge}>
            <View
              style={[
                styles.targetIcon,
                { backgroundColor: theme.colors.primary[100] },
              ]}
            >
              <Ionicons
                name="briefcase"
                size={14}
                color={theme.colors.primary[500]}
              />
            </View>
            <Text
              style={[styles.targetLabel, { color: theme.colors.text.tertiary }]}
            >
              Target Position
            </Text>
          </View>

          {/* Job Title */}
          <Text style={[styles.jobTitle, { color: theme.colors.text.primary }]}>
            {jobTitle}
          </Text>

          {/* Job Description */}
          {jobDescription && (
            <Text
              style={[styles.jobDescription, { color: theme.colors.text.secondary }]}
              numberOfLines={2}
            >
              {jobDescription}
            </Text>
          )}

          {/* Salary Badge */}
          {salary && salary.amount > 0 && (
            <View
              style={[
                styles.salaryBadge,
                { backgroundColor: theme.colors.success?.light ? `${theme.colors.success.light}20` : '#22C55E20' },
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={14}
                color={theme.colors.success?.light || '#22C55E'}
              />
              <Text
                style={[
                  styles.salaryText,
                  { color: theme.colors.success?.light || '#22C55E' },
                ]}
              >
                {formatSalary(salary.amount, salary.currency)}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Fallback if no job set */}
      {!jobTitle && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Set your target position to track progress
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  greeting: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    marginTop: 4,
  },
  jobCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  targetIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  salaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  salaryText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
