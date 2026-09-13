import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import {
  FadeInView,
  GlassCard,
  GradientButton,
  IconTile,
  ScreenBackground,
  ScreenHeader,
} from '../components/ui';

const HowToPlayScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const steps = [
    {
      icon: 'people',
      gradient: gradients.primary,
      titleKey: 'howToPlay.step1Title',
      descKey: 'howToPlay.step1Desc',
    },
    {
      icon: 'folder-open',
      gradient: gradients.success,
      titleKey: 'howToPlay.step2Title',
      descKey: 'howToPlay.step2Desc',
    },
    {
      icon: 'eye',
      gradient: gradients.warning,
      titleKey: 'howToPlay.step3Title',
      descKey: 'howToPlay.step3Desc',
    },
    {
      icon: 'search',
      gradient: gradients.danger,
      titleKey: 'howToPlay.step4Title',
      descKey: 'howToPlay.step4Desc',
    },
  ];

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('howToPlay.title')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <FadeInView key={step.titleKey} delay={index * 80}>
                <View style={styles.stepRow}>
                  {/* Zaman çizelgesi */}
                  <View style={styles.timeline}>
                    <LinearGradient
                      colors={step.gradient}
                      style={styles.stepNumber}
                    >
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </LinearGradient>
                    {!isLast && (
                      <LinearGradient
                        colors={[
                          withAlpha(step.gradient[1], 0.6),
                          withAlpha(step.gradient[1], 0.05),
                        ]}
                        style={styles.stepLine}
                      />
                    )}
                  </View>

                  <GlassCard style={styles.stepCard}>
                    <IconTile name={step.icon} gradient={step.gradient} soft />
                    <View style={styles.stepText}>
                      <Text style={styles.stepTitle}>{t(step.titleKey)}</Text>
                      <Text style={styles.stepDesc}>{t(step.descKey)}</Text>
                    </View>
                  </GlassCard>
                </View>
              </FadeInView>
            );
          })}

          {/* İpucu kutusu */}
          <FadeInView delay={steps.length * 80}>
            <LinearGradient
              colors={[
                withAlpha(colors.accentPrimary, 0.28),
                withAlpha(colors.accentPink, 0.12),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipBox}
            >
              <IconTile name="bulb" size={42} gradient={gradients.brand} />
              <Text style={styles.tipText}>{t('howToPlay.tip')}</Text>
            </LinearGradient>
          </FadeInView>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <GradientButton
            title={t('howToPlay.gotIt')}
            iconRight="checkmark"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
  },
  timeline: {
    alignItems: 'center',
    marginRight: 14,
    width: 34,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    borderRadius: 1,
  },
  stepCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 14,
    gap: 14,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: withAlpha(colors.accentPrimary, 0.4),
    gap: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});

export default HowToPlayScreen;
