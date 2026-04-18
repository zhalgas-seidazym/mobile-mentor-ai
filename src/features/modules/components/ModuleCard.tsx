import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';

interface ModuleCardProps {
  id: string;
  title: string;
  metadata: string;
  description: string;
  completed?: boolean;
  progress?: number; // 0-100
  onPress: () => void;
}

export function ModuleCard({
  title,
  metadata,
  description,
  completed = false,
  progress = 0,
  onPress,
}: ModuleCardProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          borderWidth: completed ? 2 : 1,
          borderColor: completed ? '#22C55E' : theme.colors.border.default,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: completed ? '#DCFCE7' : theme.colors.gray[100],
            },
          ]}
        >
          <Ionicons
            name={completed ? 'checkmark-circle' : 'book-outline'}
            size={22}
            color={completed ? '#22C55E' : theme.colors.gray[500]}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {title}
          </Text>
          <Text style={[styles.metadata, { color: theme.colors.text.tertiary }]}>
            {metadata}
          </Text>
        </View>
        {completed ? (
          <Ionicons name="checkmark" size={24} color="#22C55E" />
        ) : (
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[styles.description, { color: theme.colors.text.secondary }]}
        numberOfLines={2}
      >
        {description}
      </Text>

      {/* Progress bar */}
      {!completed && progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.gray[200] }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: theme.colors.primary[500] },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.tertiary }]}>
            {progress}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  metadata: {
    fontSize: 12,
    marginTop: 2,
  },
  infoButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});
