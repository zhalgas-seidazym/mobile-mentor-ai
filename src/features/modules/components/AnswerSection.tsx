import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';

interface AnswerSectionProps {
  title: string;
  content: string;
}

export function AnswerSection({ title, content }: AnswerSectionProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.md }]}>
      <Text variant="label" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
        {title}
      </Text>
      <Text variant="body" color="primary">
        {content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
