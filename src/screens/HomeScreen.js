import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, withAlpha } from '../theme/colors';
import {
  AppLogo,
  FadeInView,
  GradientButton,
  IconButton,
  ScreenBackground,
} from '../components/ui';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const modes = [
    { icon: 'text', label: t('setup.wordGame'), color: colors.success },
    {
      icon: 'help-circle',
      label: t('setup.questionGame'),
      color: colors.warning,
    },
  ];

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Üst bar */}
        <View style={styles.topBar}>
          <IconButton
            name="settings-outline"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <FadeInView>
            <AppLogo size={124} />
          </FadeInView>

          <FadeInView delay={120} style={styles.titleBlock}>
            <Text style={styles.title}>{t('app.name')}</Text>
            <View style={styles.taglinePill}>
              <Icon name="sparkles" size={14} color={colors.accentSecondary} />
              <Text style={styles.tagline}>{t('app.tagline')}</Text>
            </View>
          </FadeInView>

          <FadeInView delay={220} style={styles.modesRow}>
            {modes.map(mode => (
              <View key={mode.icon} style={styles.modeChip}>
                <View
                  style={[
                    styles.modeDot,
                    { backgroundColor: withAlpha(mode.color, 0.18) },
                  ]}
                >
                  <Icon name={mode.icon} size={14} color={mode.color} />
                </View>
                <Text style={styles.modeText} numberOfLines={1}>
                  {mode.label}
                </Text>
              </View>
            ))}
          </FadeInView>
        </View>

        {/* Butonlar */}
        <FadeInView
          delay={320}
          style={[styles.buttons, { paddingBottom: insets.bottom + 24 }]}
        >
          <GradientButton
            title={t('home.playGame')}
            icon="play"
            variant="brand"
            onPress={() => navigation.navigate('GameSetup')}
          />
          <GradientButton
            title={t('home.howToPlay')}
            icon="help-circle-outline"
            variant="secondary"
            size="md"
            onPress={() => navigation.navigate('HowToPlay')}
          />
        </FadeInView>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 60,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
    textShadowColor: withAlpha(colors.accentPink, 0.55),
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 22,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: withAlpha(colors.accentPrimary, 0.14),
    borderWidth: 1,
    borderColor: withAlpha(colors.accentPrimary, 0.3),
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accentSecondary,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 36,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  buttons: {
    paddingHorizontal: 20,
    gap: 12,
  },
});

export default HomeScreen;
