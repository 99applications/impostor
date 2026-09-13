import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients } from '../theme/colors';
import {
  FadeInView,
  GlassCard,
  IconTile,
  ScreenBackground,
} from '../components/ui';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';
import { checkOnboardingStatus } from './Onboardingscreen';

const LANGUAGE_SELECTED_KEY = '@language_selected';

const LanguageSelectScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async langCode => {
    setSelected(langCode);
    setLoading(true);
    await changeLanguage(langCode);
    await AsyncStorage.setItem(LANGUAGE_SELECTED_KEY, 'true');
    const hasOnboarded = await checkOnboardingStatus();
    setLoading(false);
    if (hasOnboarded) {
      navigation.replace('Home');
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <FadeInView style={styles.header}>
          <IconTile
            name="language"
            size={84}
            gradient={gradients.brand}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>Select Language</Text>
          <Text style={styles.subtitle}>Dil Seçin / Choose Your Language</Text>
        </FadeInView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {SUPPORTED_LANGUAGES.map((lang, index) => {
            const isSelected = selected === lang.code;
            return (
              <FadeInView key={lang.code} delay={100 + index * 60}>
                <GlassCard
                  active={isSelected}
                  style={styles.langCard}
                  onPress={() => !loading && handleSelect(lang.code)}
                >
                  <View style={styles.flagBox}>
                    <Text style={styles.flag}>{lang.flag}</Text>
                  </View>
                  <Text
                    style={[
                      styles.langName,
                      isSelected && styles.langNameActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.checkCircle}
                    >
                      <Icon
                        name="checkmark"
                        size={18}
                        color={colors.textPrimary}
                      />
                    </LinearGradient>
                  ) : (
                    <Icon
                      name="chevron-forward"
                      size={20}
                      color={colors.textMuted}
                    />
                  )}
                </GlassCard>
              </FadeInView>
            );
          })}
        </ScrollView>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  headerIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  flagBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flag: {
    fontSize: 28,
  },
  langName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langNameActive: {
    color: colors.textPrimary,
  },
  checkCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageSelectScreen;
