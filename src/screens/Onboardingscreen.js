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
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

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
      iconBg: colors.accentPrimary,
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      highlight: t('onboarding.slide1.highlight'),
    },
    {
      id: '2',
      icon: 'eye-off',
      iconBg: colors.danger,
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      highlight: t('onboarding.slide2.highlight'),
    },
    {
      id: '3',
      icon: 'chatbubbles',
      iconBg: colors.success,
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      highlight: t('onboarding.slide3.highlight'),
    },
    {
      id: '4',
      icon: 'hand-left',
      iconBg: colors.warning,
      title: t('onboarding.slide4.title'),
      description: t('onboarding.slide4.description'),
      highlight: t('onboarding.slide4.highlight'),
    },
    {
      id: '5',
      icon: 'trophy',
      iconBg: '#F59E0B',
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
    navigation.replace('Home');
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
          {/* Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: item.iconBg }]}
          >
            <Icon name={item.icon} size={64} color={colors.textPrimary} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Highlight Box */}
          {item.highlight && (
            <View style={[styles.highlightBox, { borderColor: item.iconBg }]}>
              <Icon name="bulb-outline" size={20} color={item.iconBg} />
              <Text style={styles.highlightText}>{item.highlight}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                  backgroundColor:
                    index === currentIndex
                      ? colors.accentPrimary
                      : colors.textMuted,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="search" size={24} color={colors.textPrimary} />
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
        {/* Dots */}
        {renderDots()}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {isLastSlide ? (
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={completeOnboarding}
            >
              <Text style={styles.startButtonText}>
                {t('onboarding.start')}
              </Text>
              <Icon name="arrow-forward" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>{t('onboarding.next')}</Text>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Page indicator */}
        <Text style={styles.pageIndicator}>
          {currentIndex + 1} / {slides.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
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
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  highlightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
    marginTop: 8,
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
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default OnboardingScreen;
