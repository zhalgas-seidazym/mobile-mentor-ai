import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button, Text } from '@/src/shared/components/ui';
import { useAppTheme, useTheme } from '@/src/shared/theme';
import { useSignUp } from '@/src/features/sign-up';
import { StepContainer } from '@/src/features/sign-up';
import { CountrySelector, CitySelector, CountryWithFlag } from '@/src/features/onboarding/components';
import { CityDTO } from '@/src/shared/api/types';

export function MarketRegionStep() {
  const theme = useAppTheme();
  const { isDark } = useTheme();
  const { state, setCountry, setCity, goNext, goBack, stepNumber, totalSteps } = useSignUp();
  const [selectedCountry, setSelectedCountry] = useState<CountryWithFlag | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityDTO | null>(null);

  const handleCountrySelect = (country: CountryWithFlag) => {
    setSelectedCountry(country);
    setCountry(country.name, country.id);
    setSelectedCity(null);
  };

  const handleCitySelect = (city: CityDTO) => {
    setSelectedCity(city);
    setCity(city.name, city.id);
  };

  const handleNext = () => {
    if (selectedCountry && selectedCity) {
      goNext();
    }
  };

  const isValid = selectedCountry !== null && selectedCity !== null;

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
      <View style={[styles.content, { marginTop: theme.spacing.xl }]}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text variant="h1" style={{ marginBottom: theme.spacing.sm }}>
            Set Market Region
          </Text>
          <Text
            variant="body"
            color="secondary"
            style={{ marginBottom: theme.spacing.xl }}
          >
            We'll customize your roadmap based on your location's job market
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{ marginBottom: theme.spacing.md }}
        >
          <CountrySelector
            selectedCountry={selectedCountry}
            onSelect={handleCountrySelect}
            placeholder="Choose your country"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <CitySelector
            country={selectedCountry}
            selectedCity={selectedCity}
            onSelect={handleCitySelect}
            placeholder="Choose your city"
          />
        </Animated.View>

        {selectedCountry && selectedCity && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(300)}
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? theme.colors.primary[900] : theme.colors.primary[50],
                borderRadius: theme.borderRadius.lg,
                marginTop: theme.spacing.xl,
              },
            ]}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{selectedCountry.flag}</Text>
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall" color="secondary">
                Your market region
              </Text>
              <Text variant="body" weight="semibold">
                {selectedCity.name}, {selectedCountry.name}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});
