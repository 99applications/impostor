import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, withAlpha } from '../theme/colors';
import { AppLogo, ScreenBackground } from '../components/ui';
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
    <ScreenBackground>
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
          <AppLogo size={128} />
          <Text style={styles.title}>Imposter Party</Text>
          <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>
        </Animated.View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 36,
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: withAlpha(colors.accentPink, 0.5),
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentSecondary,
  },
});

export default SplashScreen;
