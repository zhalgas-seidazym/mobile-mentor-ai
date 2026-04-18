import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';

interface QuestionItemProps {
  id: string;
  title: string;
  completed: boolean;
  onPress: () => void;
}

export function QuestionItem({ title, completed, onPress }: QuestionItemProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: completed ? theme.colors.success.light : theme.colors.primary[500],
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
      ]}
    >
      <View style={styles.content}>
        <Text variant="body" color="inverse" weight="medium" style={{ flex: 1 }}>
          {title} {completed && <Ionicons name="checkmark" size={16} color={theme.colors.white} />}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.white} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
