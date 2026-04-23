import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Icon name="language" size={40} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>Dil Seçin / Choose Your Language</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SUPPORTED_LANGUAGES.map(lang => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langCard, isSelected && styles.langCardActive]}
              activeOpacity={0.8}
              onPress={() => !loading && handleSelect(lang.code)}
            >
              <View style={[styles.flagBox, isSelected && styles.flagBoxActive]}>
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
                <View style={styles.checkCircle}>
                  <Icon name="checkmark" size={18} color={colors.textPrimary} />
                </View>
              ) : (
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  bgCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.accentGlow,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    bottom: 100,
    left: -60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
    paddingBottom: 40,
    gap: 12,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  langCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  flagBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  flagBoxActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
  flag: {
    fontSize: 26,
  },
  langName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langNameActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageSelectScreen;
