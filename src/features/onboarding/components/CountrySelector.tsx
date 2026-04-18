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
import { CountryDTO } from '@/src/shared/api/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Country flags mapping (common countries)
const COUNTRY_FLAGS: Record<string, string> = {
  'Kazakhstan': '🇰🇿',
  'Russia': '🇷🇺',
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'China': '🇨🇳',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'India': '🇮🇳',
  'Turkey': '🇹🇷',
  'UAE': '🇦🇪',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Italy': '🇮🇹',
  'Spain': '🇪🇸',
  'Netherlands': '🇳🇱',
  'Poland': '🇵🇱',
  'Ukraine': '🇺🇦',
  'Uzbekistan': '🇺🇿',
  'Kyrgyzstan': '🇰🇬',
  'Tajikistan': '🇹🇯',
  'Turkmenistan': '🇹🇲',
  'Azerbaijan': '🇦🇿',
  'Georgia': '🇬🇪',
  'Armenia': '🇦🇲',
  'Belarus': '🇧🇾',
  'Moldova': '🇲🇩',
};

const getCountryFlag = (countryName: string): string => {
  return COUNTRY_FLAGS[countryName] || '🌍';
};

export interface CountryWithFlag extends CountryDTO {
  flag: string;
}

interface CountrySelectorProps {
  selectedCountry: CountryWithFlag | null;
  onSelect: (country: CountryWithFlag) => void;
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

export function CountrySelector({
  selectedCountry,
  onSelect,
  placeholder = 'Select your country',
}: CountrySelectorProps) {
  const theme = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [countries, setCountries] = useState<CountryWithFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scale = useSharedValue(1);

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch countries from API
  const fetchCountries = useCallback(async (query?: string) => {
    setIsLoading(true);
    try {
      const response = await locationsService.searchCountries({
        q: query || undefined,
        per_page: 50,
      });
      const countriesWithFlags = response.items.map(country => ({
        ...country,
        flag: getCountryFlag(country.name),
      }));
      setCountries(countriesWithFlags);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when search changes
  useEffect(() => {
    if (modalVisible) {
      fetchCountries(debouncedQuery);
    }
  }, [debouncedQuery, modalVisible, fetchCountries]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handleSelect = (country: CountryWithFlag) => {
    onSelect(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderCountryItem = ({ item }: { item: CountryWithFlag }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        {
          backgroundColor:
            selectedCountry?.id === item.id
              ? theme.colors.primary[50]
              : 'transparent',
          borderRadius: theme.borderRadius.lg,
        },
      ]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.flag}>{item.flag}</Text>
      <Text
        variant="body"
        weight={selectedCountry?.id === item.id ? 'semibold' : 'regular'}
        style={{ flex: 1 }}
      >
        {item.name}
      </Text>
      {selectedCountry?.id === item.id && (
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

  return (
    <>
      <Animated.View style={animatedButtonStyle}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleOpen}
          activeOpacity={1}
          style={[
            styles.selector,
            {
              backgroundColor: theme.colors.surface,
              borderColor: selectedCountry
                ? theme.colors.primary[500]
                : theme.colors.border.default,
              borderRadius: theme.borderRadius.xl,
            },
          ]}
        >
          {selectedCountry ? (
            <View style={styles.selectedContent}>
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text variant="body" weight="medium">
                {selectedCountry.name}
              </Text>
            </View>
          ) : (
            <Text variant="body" color="tertiary">
              {placeholder}
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
                Select Country
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
                placeholder="Search countries..."
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
                  Loading countries...
                </Text>
              </View>
            ) : (
              <FlatList
                data={countries}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCountryItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text variant="body" color="secondary" align="center">
                      No countries found
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
  flag: {
    fontSize: 28,
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
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
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
