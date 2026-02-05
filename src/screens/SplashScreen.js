

import { checkOnboardingStatus } from './Onboardingscreen';

const checkAndNavigate = async () => {
  const hasCompletedOnboarding = await checkOnboardingStatus();

  if (hasCompletedOnboarding) {
    navigation.replace('Home');
  } else {
    navigation.replace('Onboarding');
  }
};

// Animasyonunuz bittiğinde checkAndNavigate() çağırın

// ============================================
// TAM ÖRNEK SPLASHSCREEN
// ============================================
// Eğer mevcut SplashScreen'iniz basitse, aşağıdaki gibi güncelleyebilirsiniz:

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animasyonları başlat
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2 saniye sonra kontrol et ve yönlendir
    const timer = setTimeout(async () => {
      const hasCompletedOnboarding = await checkOnboardingStatus();

      if (hasCompletedOnboarding) {
        navigation.replace('Home');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon name="search" size={48} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>Imposter Party</Text>
        <Text style={styles.subtitle}>Sahtekarı Bul!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default SplashScreen;
