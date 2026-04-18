import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { getMatchGradient } from '@/src/shared/utils/skillMatch';

interface SkillMatchSummaryProps {
  matchedCount: number;
  totalCount: number;
}

export function SkillMatchSummary({ matchedCount, totalCount }: SkillMatchSummaryProps) {
  const theme = useAppTheme();

  if (totalCount === 0) {
    return null;
  }

  const matchPercentage = Math.round((matchedCount / totalCount) * 100);
  const { gradient, label } = getMatchGradient(matchPercentage);

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { borderRadius: theme.spacing.md }]}
    >
      <View style={styles.content}>
        <View style={styles.circleContainer}>
          <View style={styles.circle}>
            <Text style={styles.percentageText}>{matchPercentage}%</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.detail}>
            {matchedCount} of {totalCount} skills matched
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${matchPercentage}%` }]} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleContainer: {
    marginRight: 16,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  detail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
