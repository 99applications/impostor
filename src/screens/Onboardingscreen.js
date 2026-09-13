import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import {
  AppLogo,
  GlassCard,
  GradientButton,
  IconTile,
  ScreenBackground,
} from '../components/ui';

const { width } = Dimensions.get('window');

export const ONBOARDING_KEY = '@onboarding_completed';

// Onboarding durumunu kontrol eden yardımcı fonksiyon
export const checkOnboardingStatus = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.log('Error checking onboarding status:', error);
    return false;
  }
};

// Onboarding'i sıfırlamak için (test/ayarlar için)
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    return true;
  } catch (error) {
    console.log('Error resetting onboarding:', error);
    return false;
  }
};

const OnboardingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides = [
    {
      id: '1',
      icon: 'people',
      gradient: gradients.primary,
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      highlight: t('onboarding.slide1.highlight'),
    },
    {
      id: '2',
      icon: 'eye-off',
      gradient: gradients.danger,
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      highlight: t('onboarding.slide2.highlight'),
    },
    {
      id: '3',
      icon: 'chatbubbles',
      gradient: gradients.success,
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      highlight: t('onboarding.slide3.highlight'),
    },
    {
      id: '4',
      icon: 'hand-left',
      gradient: gradients.info,
      title: t('onboarding.slide4.title'),
      description: t('onboarding.slide4.description'),
      highlight: t('onboarding.slide4.highlight'),
    },
    {
      id: '5',
      icon: 'trophy',
      gradient: gradients.warning,
      title: t('onboarding.slide5.title'),
      description: t('onboarding.slide5.description'),
      highlight: t('onboarding.slide5.highlight'),
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
    // Onboarding sonrası paywall; paywall kapatılınca Home'a geçer.
    navigation.replace('Paywall');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    const accent = item.gradient[item.gradient.length - 1];

    return (
      <View style={styles.slide}>
        <Animated.View
          style={[
            styles.slideContent,
            {
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}
        >
          {/* Icon + halo */}
          <View style={styles.iconArea}>
            <View
              style={[styles.halo, { backgroundColor: withAlpha(accent, 0.1) }]}
            />
            <View
              style={[
                styles.haloInner,
                { backgroundColor: withAlpha(accent, 0.16) },
              ]}
            />
            <IconTile
              name={item.icon}
              size={132}
              iconSize={64}
              gradient={item.gradient}
            />
          </View>

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {!!item.highlight && (
            <GlassCard
              style={[
                styles.highlightBox,
                { borderColor: withAlpha(accent, 0.45) },
              ]}
            >
              <Icon name="bulb" size={20} color={item.gradient[0]} />
              <Text style={styles.highlightText}>{item.highlight}</Text>
            </GlassCard>
          )}
        </Animated.View>
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <AppLogo size={34} animated={false} />
            <Text style={styles.logoText}>Imposter Party</Text>
          </View>
          {!isLastSlide && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true },
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />

        {/* Bottom Section */}
        <View
          style={[styles.bottomSection, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.dotsContainer}>
            {slides.map((slide, index) =>
              index === currentIndex ? (
                <LinearGradient
                  key={slide.id}
                  colors={gradients.brand}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.dot, styles.dotActive]}
                />
              ) : (
                <View key={slide.id} style={styles.dot} />
              ),
            )}
          </View>

          <GradientButton
            title={isLastSlide ? t('onboarding.start') : t('onboarding.next')}
            iconRight={isLastSlide ? 'arrow-forward' : 'chevron-forward'}
            variant={isLastSlide ? 'brand' : 'primary'}
            onPress={handleNext}
          />

          <Text style={styles.pageIndicator}>
            {currentIndex + 1} / {slides.length}
          </Text>
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconArea: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  halo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  haloInner: {
    position: 'absolute',
    width: 186,
    height: 186,
    borderRadius: 93,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 24,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  highlightText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    width: 28,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});

export default OnboardingScreen;
