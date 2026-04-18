import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '@/src/shared/components/ui';
import { useAppTheme } from '@/src/shared/theme';
import { locationsService } from '@/src/shared/api/services';
import { CityDTO } from '@/src/shared/api/types';
import { CountryWithFlag } from './CountrySelector';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CitySelectorProps {
  country: CountryWithFlag | null;
  selectedCity: CityDTO | null;
  onSelect: (city: CityDTO) => void;
  placeholder?: string;
}

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

export function CitySelector({
  country,
  selectedCity,
  onSelect,
  placeholder = 'Select your city',
}: CitySelectorProps) {
  const theme = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [cities, setCities] = useState<CityDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scale = useSharedValue(1);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch cities from API
  const fetchCities = useCallback(async (query?: string) => {
    if (!country) return;

    setIsLoading(true);
    try {
      const response = await locationsService.searchCities({
        country_id: country.id,
        q: query || undefined,
        per_page: 50,
      });
      setCities(response.items);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, [country]);

  // Fetch when modal opens or search changes
  useEffect(() => {
    if (modalVisible && country) {
      fetchCities(debouncedQuery);
    }
  }, [debouncedQuery, modalVisible, country, fetchCities]);

  // Reset cities when country changes
  useEffect(() => {
    setCities([]);
  }, [country?.id]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleSelect = (city: CityDTO) => {
    onSelect(city);
    handleClose();
  };

  const handleOpen = () => {
    if (country) {
      setModalVisible(true);
    }
  };

  const renderCityItem = ({ item }: { item: CityDTO }) => (
    <TouchableOpacity
      style={[
        styles.cityItem,
        {
          backgroundColor:
            selectedCity?.id === item.id ? theme.colors.primary[50] : 'transparent',
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cityIcon}>
        <Text style={{ fontSize: 20 }}>📍</Text>
      </View>
      <Text
        variant="body"
        weight={selectedCity?.id === item.id ? 'semibold' : 'regular'}
        style={{ flex: 1 }}
      >
        {item.name}
      </Text>
      {selectedCity?.id === item.id && (
        <View
          style={[
            styles.checkmark,
            { backgroundColor: theme.colors.primary[500] },
          ]}
        >
          <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const isDisabled = !country;

  return (
    <>
      <Animated.View style={animatedButtonStyle}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleOpen}
          activeOpacity={1}
          disabled={isDisabled}
          style={[
            styles.selector,
            {
              backgroundColor: isDisabled
                ? theme.colors.surfaceSecondary
                : theme.colors.surface,
              borderColor: selectedCity
                ? theme.colors.primary[500]
                : theme.colors.border.default,
              borderRadius: theme.borderRadius.xl,
              opacity: isDisabled ? 0.6 : 1,
            },
          ]}
        >
          {selectedCity ? (
            <View style={styles.selectedContent}>
              <Text style={{ fontSize: 24 }}>📍</Text>
              <Text variant="body" weight="medium">
                {selectedCity.name}
              </Text>
            </View>
          ) : (
            <Text variant="body" color="tertiary">
              {isDisabled ? 'Select a country first' : placeholder}
            </Text>
          )}
          <Text style={StyleSheet.flatten([styles.chevron, { color: theme.colors.text.tertiary }])}>
            ▼
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handleClose}
            activeOpacity={1}
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: theme.borderRadius.xxl,
                borderTopRightRadius: theme.borderRadius.xxl,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalHandle,
                  { backgroundColor: theme.colors.gray[300] },
                ]}
              />
              <Text variant="h2" align="center" style={{ marginTop: 16 }}>
                Select City
              </Text>
              <Text variant="bodySmall" color="secondary" align="center">
                {country?.flag} {country?.name}
              </Text>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderRadius: theme.borderRadius.lg,
                  marginHorizontal: 16,
                  marginBottom: 12,
                },
              ]}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
              <TextInput
                style={[
                  styles.searchInput,
                  { color: theme.colors.text.primary },
                ]}
                placeholder="Search cities..."
                placeholderTextColor={theme.colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                <Text variant="bodySmall" color="secondary" style={{ marginTop: 8 }}>
                  Loading cities...
                </Text>
              </View>
            ) : (
              <FlatList
                data={cities}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCityItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text variant="body" color="secondary" align="center">
                      No cities found
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cityIcon: {
    width: 32,
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 40,
  },
});
