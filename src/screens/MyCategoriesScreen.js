import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import {
  FadeInView,
  GlassCard,
  GradientButton,
  IconButton,
  IconTile,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
} from '../components/ui';

const TILE_GRADIENTS = [
  gradients.brand,
  gradients.primary,
  gradients.success,
  gradients.info,
  gradients.warning,
  gradients.danger,
];

const MyCategoriesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state } = useGame();
  const { isPremium } = usePremium();

  const customCategories = Object.values(state.customCategories || {});

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('myCategories.title')}
          onBack={() => navigation.goBack()}
          right={
            <IconButton
              name="add"
              variant="accent"
              iconSize={24}
              onPress={() => navigation.navigate('CustomCategory')}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Banner (premium değilse) */}
          {!isPremium && (
            <PressableScale
              scaleTo={0.98}
              onPress={() =>
                navigation.navigate('Paywall', { onboarding: false })
              }
            >
              <LinearGradient
                colors={[
                  withAlpha(colors.warning, 0.28),
                  withAlpha(colors.accentPink, 0.12),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumBanner}
              >
                <IconTile name="diamond" size={46} gradient={gradients.warning} />
                <View style={styles.premiumBannerInfo}>
                  <Text style={styles.premiumBannerTitle}>
                    {t('myCategories.premiumTitle')}
                  </Text>
                  <Text style={styles.premiumBannerDesc}>
                    {t('myCategories.premiumDesc')}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.warning} />
              </LinearGradient>
            </PressableScale>
          )}

          {customCategories.length > 0 ? (
            <View style={styles.categoryList}>
              {customCategories.map((category, index) => (
                <FadeInView key={category.id} delay={index * 60}>
                  <GlassCard
                    style={styles.categoryCard}
                    onPress={() =>
                      navigation.navigate('CustomCategory', { category })
                    }
                  >
                    <IconTile
                      name={category.icon || 'folder'}
                      size={52}
                      gradient={TILE_GRADIENTS[index % TILE_GRADIENTS.length]}
                    />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName} numberOfLines={1}>
                        {category.name}
                      </Text>
                      <View style={styles.countPill}>
                        <Icon name="text" size={12} color={colors.accentSecondary} />
                        <Text style={styles.categoryCount}>
                          {category.words?.length || 0}{' '}
                          {t('categorySelect.words')}
                        </Text>
                      </View>
                    </View>
                    <Icon name="create-outline" size={20} color={colors.textMuted} />
                  </GlassCard>
                </FadeInView>
              ))}
            </View>
          ) : (
            <FadeInView style={styles.emptyState}>
              <View style={styles.emptyHalo}>
                <IconTile
                  name="folder-open"
                  size={96}
                  iconSize={48}
                  gradient={gradients.primary}
                  soft
                />
              </View>
              <Text style={styles.emptyTitle}>{t('myCategories.emptyTitle')}</Text>
              <Text style={styles.emptyDesc}>{t('myCategories.emptyDesc')}</Text>
              <GradientButton
                title={t('myCategories.create')}
                icon="add"
                size="md"
                style={styles.createButton}
                onPress={() => navigation.navigate('CustomCategory')}
              />
            </FadeInView>
          )}
        </ScrollView>
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
    paddingTop: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, 0.4),
  },
  premiumBannerInfo: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fcd34d',
    marginBottom: 2,
  },
  premiumBannerDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryList: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: withAlpha(colors.accentPrimary, 0.16),
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 12,
  },
  emptyHalo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: withAlpha(colors.accentPrimary, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  createButton: {
    alignSelf: 'stretch',
  },
});

export default MyCategoriesScreen;
