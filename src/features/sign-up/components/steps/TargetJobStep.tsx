import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Input, Text } from '@/src/shared/components/ui';
import { useAppTheme, useTheme } from '@/src/shared/theme';
import { useSignUp } from '../../context/SignUpContext';
import { StepContainer } from '../layout/StepContainer';
import { JobResultItem } from '../ui/JobResultItem';
import { directionsService } from '@/src/shared/api/services';
import { DirectionDTO, SalaryDTO } from '@/src/shared/api/types';
import { Job } from '../../types';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function TargetJobStep() {
  const theme = useAppTheme();
  const { isDark } = useTheme();
  const { state, setTargetJob, goNext, goBack, stepNumber, totalSteps } = useSignUp();
  const [searchQuery, setSearchQuery] = useState('');
  const [directions, setDirections] = useState<DirectionDTO[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<SalaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Debounce search query by 300ms
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch directions when debounced query changes
  useEffect(() => {
    const fetchDirections = async () => {
      setIsLoading(true);
      setShowAISuggestions(false);
      try {
        const response = await directionsService.autocomplete({
          q: debouncedQuery || undefined,
          per_page: 20,
        });
        setDirections(response.items);
        setHasSearched(true);
      } catch (error) {
        console.error('Failed to fetch directions:', error);
        setDirections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirections();
  }, [debouncedQuery]);

  // Convert DirectionDTO to Job format for compatibility
  const convertToJob = useCallback((direction: DirectionDTO, salary?: string): Job => {
    return {
      id: direction.id.toString(),
      title: direction.name,
      subtitle: direction.description || 'Career Direction',
      salary: salary || '',
    };
  }, []);

  const handleJobSelect = (direction: DirectionDTO, salary?: string) => {
    const job = convertToJob(direction, salary);
    setTargetJob(state.targetJob?.id === job.id ? null : job);
  };

  // Create a new direction when it doesn't exist
  const handleCreateDirection = async () => {
    if (!searchQuery.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newDirection = await directionsService.create(searchQuery.trim());
      const job = convertToJob(newDirection);
      setTargetJob(job);
      // Add to the list so it's visible
      setDirections((prev) => [newDirection, ...prev]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create direction:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = () => {
    if (state.targetJob) {
      goNext();
    }
  };

  // Fetch AI-recommended directions based on user's city and skills
  const handleSuggestionsPress = async () => {
    if (!state.cityId) {
      console.error('No city selected');
      return;
    }

    setIsLoadingAI(true);
    setShowAISuggestions(true);
    try {
      const response = await directionsService.getAIDirections({
        city_id: state.cityId,
        skills: state.selectedSkills.length > 0 ? state.selectedSkills : undefined,
      });
      setAiSuggestions(response);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      // Fallback to regular autocomplete
      try {
        const fallbackResponse = await directionsService.autocomplete({
          per_page: 10,
        });
        setDirections(fallbackResponse.items);
        setShowAISuggestions(false);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const isValid = state.targetJob !== null;
  const showCreateOption = hasSearched && directions.length === 0 && searchQuery.trim().length > 0 && !showAISuggestions;

  const formatSalary = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}/mo`;
  };

  return (
    <StepContainer
      currentStep={stepNumber}
      totalSteps={totalSteps}
      onBack={goBack}
      footer={
        <Button onPress={handleNext} variant="primary" size="lg" disabled={!isValid}>
          Next
        </Button>
      }
    >
      <View style={[styles.content, { marginTop: theme.spacing.xxl }]}>
        <Text variant="h2" style={{ marginBottom: theme.spacing.lg }}>
          Set your target job
        </Text>

        <Input
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowAISuggestions(false);
          }}
          containerStyle={{ marginBottom: theme.spacing.sm }}
        />

        <TouchableOpacity
          onPress={handleSuggestionsPress}
          style={[
            styles.aiSuggestButton,
            { 
              marginBottom: theme.spacing.lg,
              backgroundColor: showAISuggestions && aiSuggestions.length > 0 
                ? (isDark ? theme.colors.primary[900] : theme.colors.primary[50])
                : 'transparent',
              padding: showAISuggestions && aiSuggestions.length > 0 ? 12 : 0,
              borderRadius: theme.borderRadius.lg,
            }
          ]}
          disabled={isLoadingAI}
        >
          <View style={styles.aiSuggestContent}>
            <Ionicons 
              name="sparkles" 
              size={18} 
              color={theme.colors.primary[500]} 
              style={{ marginRight: 6 }}
            />
            <Text variant="bodySmall" color="link">
              {isLoadingAI 
                ? 'AI is analyzing your skills...' 
                : showAISuggestions && aiSuggestions.length > 0
                  ? 'AI Recommendations based on your skills'
                  : 'Not sure what to choose? Tap here for AI suggestions'}
            </Text>
          </View>
        </TouchableOpacity>

        {isLoading || isLoadingAI ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary[500]} />
            <Text variant="bodySmall" color="secondary" style={{ marginTop: theme.spacing.sm }}>
              {isLoadingAI ? 'Getting AI recommendations...' : 'Searching...'}
            </Text>
          </View>
        ) : showAISuggestions && aiSuggestions.length > 0 ? (
          // AI Suggestions with salary info
          <FlatList
            data={aiSuggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => {
              const job = item.direction ? convertToJob(item.direction, formatSalary(item.amount, item.currency)) : null;
              if (!job || !item.direction) return null;

              return (
                <Animated.View 
                  entering={FadeInDown.delay(index * 100).duration(300)}
                  style={{ marginBottom: theme.spacing.sm }}
                >
                  <TouchableOpacity
                    style={[
                      styles.aiJobCard,
                      {
                        backgroundColor: state.targetJob?.id === job.id 
                          ? (isDark ? theme.colors.primary[800] : theme.colors.primary[100])
                          : theme.colors.surface,
                        borderColor: state.targetJob?.id === job.id 
                          ? theme.colors.primary[500]
                          : theme.colors.border.default,
                        borderRadius: theme.borderRadius.lg,
                      },
                    ]}
                    onPress={() => handleJobSelect(item.direction!, formatSalary(item.amount, item.currency))}
                    activeOpacity={0.7}
                  >
                    <View style={styles.aiJobContent}>
                      <View style={styles.aiJobInfo}>
                        <View style={styles.aiJobHeader}>
                          <Ionicons 
                            name="sparkles" 
                            size={14} 
                            color={theme.colors.primary[500]} 
                          />
                          <Text variant="caption" color="link" style={{ marginLeft: 4 }}>
                            AI Recommended
                          </Text>
                        </View>
                        <Text variant="body" weight="semibold" numberOfLines={1}>
                          {item.direction.name}
                        </Text>
                        {item.direction.description && (
                          <Text variant="bodySmall" color="secondary" numberOfLines={1}>
                            {item.direction.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.salaryBadge}>
                        <Text 
                          variant="bodySmall" 
                          weight="bold"
                          style={{ color: theme.colors.success?.light || '#22C55E' }}
                        >
                          {formatSalary(item.amount, item.currency)}
                        </Text>
                      </View>
                    </View>
                    {state.targetJob?.id === job.id && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={24} 
                        color={theme.colors.primary[500]} 
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
            ListFooterComponent={
              <TouchableOpacity 
                onPress={() => setShowAISuggestions(false)}
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <Text variant="bodySmall" color="secondary">
                  Or search manually above
                </Text>
              </TouchableOpacity>
            }
          />
        ) : showCreateOption ? (
          // No results found - show create option
          <View style={styles.createContainer}>
            <Text variant="body" color="secondary" align="center" style={{ marginBottom: theme.spacing.lg }}>
              No jobs found for "{searchQuery}"
            </Text>
            <TouchableOpacity
              onPress={handleCreateDirection}
              disabled={isCreating}
              style={[
                styles.createButton,
                {
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing.md,
                },
              ]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <View style={styles.createButtonContent}>
                  <Ionicons name="add-circle-outline" size={24} color={theme.colors.white} />
                  <Text
                    variant="body"
                    style={{ color: theme.colors.white, marginLeft: theme.spacing.sm, fontWeight: '600' }}
                  >
                    Create "{searchQuery.trim()}"
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : directions.length === 0 && hasSearched ? (
          <View style={styles.emptyContainer}>
            <Text variant="body" color="secondary" align="center">
              Start typing to search for jobs
            </Text>
          </View>
        ) : (
          <FlatList
            data={directions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const job = convertToJob(item);
              return (
                <View style={{ marginBottom: theme.spacing.sm }}>
                  <JobResultItem
                    title={job.title}
                    subtitle={job.subtitle}
                    salary={job.salary}
                    selected={state.targetJob?.id === job.id}
                    onPress={() => handleJobSelect(item)}
                  />
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          />
        )}
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  createContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  createButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSuggestButton: {},
  aiSuggestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiJobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  aiJobContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiJobInfo: {
    flex: 1,
    marginRight: 12,
  },
  aiJobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  salaryBadge: {
    alignItems: 'flex-end',
  },
});
