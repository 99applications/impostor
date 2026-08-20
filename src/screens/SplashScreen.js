import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { checkOnboardingStatus } from './Onboardingscreen';

const LANGUAGE_SELECTED_KEY = '@language_selected';

const SplashScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let isMounted = true;

    // Animasyonları başlat
    const animation = Animated.parallel([
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
    ]);
    animation.start();

    // 2 saniye sonra kontrol et ve yönlendir
    const timer = setTimeout(async () => {
      const languageSelected = await AsyncStorage.getItem(
        LANGUAGE_SELECTED_KEY,
      );
      if (!isMounted) return;

      if (!languageSelected) {
        // Kullanıcı manuel dil seçmemiş → dil seçim ekranına git
        navigation.replace('LanguageSelect');
        return;
      }
      const hasCompletedOnboarding = await checkOnboardingStatus();
      if (!isMounted) return;

      if (hasCompletedOnboarding) {
        navigation.replace('Home');
      } else {
        navigation.replace('Onboarding');
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Ekran değişirken animasyon çalışmaya devam ederse, native animasyon
      // düğümleri kaldırılmışken bağlanmaya çalışılıyor ve
      // NativeAnimatedNodesManager.connectAnimatedNodes çakışıyor.
      animation.stop();
    };
    // fadeAnim/scaleAnim useRef ile olusturuldugu icin referanslari sabittir.
  }, [navigation, fadeAnim, scaleAnim]);

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
        <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>
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
