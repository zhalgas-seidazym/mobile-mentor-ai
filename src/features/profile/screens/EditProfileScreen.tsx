import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/src/shared/components/ui';
import { Input } from '@/src/shared/components/ui/Input';
import { Button } from '@/src/shared/components/ui/Button';
import { useAppTheme } from '@/src/shared/theme';
import { useAuthStore } from '@/src/shared/stores';
import { useUserStore } from '@/src/shared/stores/userStore';
import { CountrySelector, CountryWithFlag } from '@/src/features/onboarding/components/CountrySelector';
import { CitySelector } from '@/src/features/onboarding/components/CitySelector';
import { directionsService, skillsService } from '@/src/shared/api/services';
import { DirectionDTO, SkillDTO, CityDTO, UserProfileUpdateSchema } from '@/src/shared/api/types';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function extractSkills(user: ReturnType<typeof useAuthStore.getState>['user']): SkillDTO[] {
  const source = (user?.skills && user.skills.length > 0) ? user.skills : user?.modules;
  if (!source || source.length === 0) return [];
  const raw = source.filter((m) => m.skill).map((m) => m.skill!);
  const seen = new Set<number>();
  return raw.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

export function EditProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { updateProfile, fetchProfile } = useUserStore();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [selectedCountry, setSelectedCountry] = useState<CountryWithFlag | null>(
    user?.city?.country
      ? { ...user.city.country, flag: '' }
      : null,
  );
  const [selectedCity, setSelectedCity] = useState<CityDTO | null>(user?.city || null);
  const [selectedDirection, setSelectedDirection] = useState<DirectionDTO | null>(user?.direction || null);
  const [directionQuery, setDirectionQuery] = useState('');
  const [directionResults, setDirectionResults] = useState<DirectionDTO[]>([]);
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<SkillDTO[]>(() => extractSkills(user));

  // Fetch fresh profile on mount to ensure skills, city, and direction are populated
  const [profileLoaded, setProfileLoaded] = useState(false);
  useEffect(() => {
    fetchProfile().finally(() => setProfileLoaded(true));
  }, []);

  // Sync form state when user data updates from fetch (only on initial load)
  useEffect(() => {
    if (!profileLoaded || !user) return;
    // Only update fields that are still at their default/empty values
    if (!selectedCountry && user.city?.country) {
      setSelectedCountry({ ...user.city.country, flag: '' });
    }
    if (!selectedCity && user.city) {
      setSelectedCity(user.city);
    }
    if (!selectedDirection && user.direction) {
      setSelectedDirection(user.direction);
    }
    const freshSkills = extractSkills(user);
    if (selectedSkills.length === 0 && freshSkills.length > 0) {
      setSelectedSkills(freshSkills);
    }
  }, [profileLoaded, user]);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillResults, setSkillResults] = useState<SkillDTO[]>([]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const debouncedDirectionQuery = useDebounce(directionQuery, 300);
  const debouncedSkillQuery = useDebounce(skillQuery, 300);

  // Direction autocomplete
  useEffect(() => {
    if (!debouncedDirectionQuery.trim()) {
      setDirectionResults([]);
      return;
    }
    (async () => {
      try {
        const res = await directionsService.autocomplete({ q: debouncedDirectionQuery, per_page: 10 });
        setDirectionResults(res.items);
      } catch {
        setDirectionResults([]);
      }
    })();
  }, [debouncedDirectionQuery]);

  // Skill autocomplete
  useEffect(() => {
    if (!debouncedSkillQuery.trim()) {
      setSkillResults([]);
      return;
    }
    (async () => {
      try {
        const res = await skillsService.autocomplete({ q: debouncedSkillQuery, per_page: 10 });
        const existingIds = new Set(selectedSkills.map((s) => s.id));
        setSkillResults(res.items.filter((s) => !existingIds.has(s.id)));
      } catch {
        setSkillResults([]);
      }
    })();
  }, [debouncedSkillQuery, selectedSkills]);

  const handleSelectDirection = (dir: DirectionDTO) => {
    setSelectedDirection(dir);
    setDirectionQuery('');
    setDirectionResults([]);
    setShowDirectionDropdown(false);
  };

  const handleAddSkill = (skill: SkillDTO) => {
    setSelectedSkills((prev) => [...prev, skill]);
    setSkillQuery('');
    setSkillResults([]);
    setShowSkillDropdown(false);
  };

  const [isCreatingSkill, setIsCreatingSkill] = useState(false);

  const handleCreateAndAddSkill = async () => {
    const trimmed = skillQuery.trim();
    if (!trimmed) return;
    // Check if already selected
    if (selectedSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkillQuery('');
      setShowSkillDropdown(false);
      return;
    }
    setIsCreatingSkill(true);
    try {
      const newSkill = await skillsService.create(trimmed);
      handleAddSkill(newSkill);
    } catch {
      Alert.alert('Error', 'Failed to add skill. Please try again.');
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  const handleCountrySelect = useCallback((country: CountryWithFlag) => {
    setSelectedCountry(country);
    setSelectedCity(null);
  }, []);

  const handleSave = async () => {
    const data: UserProfileUpdateSchema = {};

    if (name.trim() && name.trim() !== user?.name) {
      data.name = name.trim();
    }
    if (selectedCity && selectedCity.id !== user?.city_id) {
      data.city_id = selectedCity.id;
    }
    if (selectedDirection && selectedDirection.id !== user?.direction_id) {
      data.direction_id = selectedDirection.id;
    }

    const currentSkillIds = (user?.skills || []).map((s) => s.skill_id).sort();
    const newSkillIds = selectedSkills.map((s) => s.id).sort();
    if (JSON.stringify(currentSkillIds) !== JSON.stringify(newSkillIds)) {
      data.skill_ids = newSkillIds;
    }

    data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (showPasswordSection && oldPassword && newPassword) {
      data.password = oldPassword;
      data.new_password = newPassword;
    }

    if (Object.keys(data).length === 1 && data.timezone) {
      // Only timezone changed, nothing meaningful
      router.back();
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(data);
      await fetchProfile();
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border.default }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Name</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Country</Text>
            <CountrySelector
              selectedCountry={selectedCountry}
              onSelect={handleCountrySelect}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>City</Text>
            <CitySelector
              country={selectedCountry}
              selectedCity={selectedCity}
              onSelect={setSelectedCity}
            />
          </View>

          {/* Direction */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Direction</Text>
            {selectedDirection && (
              <View style={[styles.selectedChip, { backgroundColor: theme.colors.primary[50] }]}>
                <Text style={[styles.selectedChipText, { color: theme.colors.primary[500] }]}>
                  {selectedDirection.name}
                </Text>
                <TouchableOpacity onPress={() => setSelectedDirection(null)}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.primary[400]} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={[
                  styles.autocompleteInput,
                  {
                    backgroundColor: theme.colors.input.background,
                    borderColor: showDirectionDropdown ? theme.colors.border.focus : theme.colors.input.border,
                    borderRadius: theme.borderRadius.lg,
                    color: theme.colors.input.text,
                  },
                ]}
                placeholder={selectedDirection ? 'Change direction...' : 'Search direction...'}
                placeholderTextColor={theme.colors.input.placeholder}
                value={directionQuery}
                onChangeText={(text) => {
                  setDirectionQuery(text);
                  setShowDirectionDropdown(true);
                }}
                onFocus={() => setShowDirectionDropdown(true)}
                onBlur={() => setTimeout(() => setShowDirectionDropdown(false), 200)}
              />
              {showDirectionDropdown && directionResults.length > 0 && (
                <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.default }]}>
                  {directionResults.map((dir) => (
                    <TouchableOpacity
                      key={dir.id}
                      style={[styles.dropdownItem, { borderBottomColor: theme.colors.border.default }]}
                      onPress={() => handleSelectDirection(dir)}
                    >
                      <Text style={{ color: theme.colors.text.primary }}>{dir.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>Skills</Text>
            {selectedSkills.length > 0 && (
              <View style={styles.chipsContainer}>
                {selectedSkills.map((skill) => (
                  <View key={`skill-${skill.id}`} style={[styles.chip, { backgroundColor: theme.colors.primary[50] }]}>
                    <Text style={[styles.chipText, { color: theme.colors.primary[500] }]}>{skill.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSkill(skill.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={16} color={theme.colors.primary[400]} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={[
                  styles.autocompleteInput,
                  {
                    backgroundColor: theme.colors.input.background,
                    borderColor: showSkillDropdown ? theme.colors.border.focus : theme.colors.input.border,
                    borderRadius: theme.borderRadius.lg,
                    color: theme.colors.input.text,
                  },
                ]}
                placeholder="Search skills to add..."
                placeholderTextColor={theme.colors.input.placeholder}
                value={skillQuery}
                onChangeText={(text) => {
                  setSkillQuery(text);
                  setShowSkillDropdown(true);
                }}
                onFocus={() => setShowSkillDropdown(true)}
                onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                onSubmitEditing={handleCreateAndAddSkill}
                returnKeyType="done"
              />
              {showSkillDropdown && (skillResults.length > 0 || skillQuery.trim()) && (
                <View style={[styles.dropdown, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.default }]}>
                  {skillResults.map((skill) => (
                    <TouchableOpacity
                      key={skill.id}
                      style={[styles.dropdownItem, { borderBottomColor: theme.colors.border.default }]}
                      onPress={() => handleAddSkill(skill)}
                    >
                      <Text style={{ color: theme.colors.text.primary }}>{skill.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {skillQuery.trim() && !skillResults.some((s) => s.name.toLowerCase() === skillQuery.trim().toLowerCase()) && (
                    <TouchableOpacity
                      style={[styles.dropdownItem, { borderBottomColor: theme.colors.border.default }]}
                      onPress={handleCreateAndAddSkill}
                      disabled={isCreatingSkill}
                    >
                      <View style={styles.createSkillRow}>
                        {isCreatingSkill ? (
                          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                        ) : (
                          <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary[500]} />
                        )}
                        <Text style={{ color: theme.colors.primary[500], fontWeight: '600', marginLeft: 8 }}>
                          Add "{skillQuery.trim()}"
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Password Change */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary, marginBottom: 0 }]}>
                Change Password
              </Text>
              <Ionicons
                name={showPasswordSection ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
            {showPasswordSection && (
              <View style={styles.passwordFields}>
                <Input
                  label="Current Password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="Enter current password"
                />
                <View style={{ height: 12 }} />
                <Input
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="Enter new password"
                />
              </View>
            )}
          </View>

          {/* Save Button */}
          <View style={styles.saveContainer}>
            <Button onPress={handleSave} loading={isSaving} disabled={isSaving}>
              Save Changes
            </Button>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1,
  },
  autocompleteInput: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  },
  selectedChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  createSkillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  passwordFields: {
    marginTop: 4,
  },
  saveContainer: {
    marginTop: 8,
  },
});
