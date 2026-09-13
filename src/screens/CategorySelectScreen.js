import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import { CATEGORIES, getCategoryContentCount } from '../data/gameData';
import {
  GlassCard,
  GradientButton,
  IconTile,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';

// Kategorilere sırayla atanan renkler.
const TILE_GRADIENTS = [
  gradients.primary,
  gradients.success,
  gradients.info,
  gradients.warning,
  gradients.danger,
  gradients.brand,
];

const LOCKED_GRADIENT = ['#8a86ab', '#3a3462'];

const CategorySelectScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, setSelectedCategories } = useGame();
  const { isPremium } = usePremium();

  // Local state - seçili kategoriler
  const [selectedCategories, setLocalSelectedCategories] = useState([]);

  // Component mount olduğunda mevcut seçimleri yükle
  useEffect(() => {
    if (state.selectedCategories && state.selectedCategories.length > 0) {
      setLocalSelectedCategories(state.selectedCategories);
    } else {
      // Varsayılan olarak ilk ücretsiz kategoriyi seç
      setLocalSelectedCategories(['food']);
    }
  }, []);

  // Kategori seç/kaldır
  const toggleCategory = categoryId => {
    const category = CATEGORIES[categoryId];

    // Custom kategori ise premium kontrolü yap
    if (!category) {
      const customCategory = state.customCategories?.[categoryId];
      if (customCategory) {
        setLocalSelectedCategories(prev => {
          if (prev.includes(categoryId)) {
            if (prev.length === 1) return prev;
            return prev.filter(id => id !== categoryId);
          } else {
            return [...prev, categoryId];
          }
        });
        return;
      }
    }

    // Premium kategori kontrolü - sistem uyarısı yerine paywall ekranını aç.
    // onboarding: false → paywall kapatılınca buraya geri döner.
    if (category?.isPremium && !isPremium) {
      navigation.navigate('Paywall', { onboarding: false });
      return;
    }

    setLocalSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // En az 1 kategori seçili olmalı
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Tümünü seç (sadece erişilebilir olanlar)
  const selectAll = () => {
    const accessibleCategories = Object.keys(CATEGORIES).filter(
      id => !CATEGORIES[id].isPremium || isPremium,
    );
    // Custom kategorileri de ekle (premium ise)
    if (isPremium) {
      const customCategoryIds = Object.keys(state.customCategories || {});
      setLocalSelectedCategories([
        ...accessibleCategories,
        ...customCategoryIds,
      ]);
    } else {
      setLocalSelectedCategories(accessibleCategories);
    }
  };

  // Tümünü kaldır (ilk ücretsiz kategori hariç)
  const deselectAll = () => {
    setLocalSelectedCategories(['food']);
  };

  // Kaydet ve geri dön
  const handleSave = () => {
    setSelectedCategories(selectedCategories);
    navigation.goBack();
  };

  // Toplam içerik sayısı
  const getTotalCount = () => {
    let totalWords = 0;
    let totalQuestions = 0;

    selectedCategories.forEach(categoryId => {
      // Custom kategori mi kontrol et
      if (state.customCategories?.[categoryId]) {
        totalWords += state.customCategories[categoryId].words?.length || 0;
        totalQuestions +=
          state.customCategories[categoryId].questions?.length || 0;
      } else {
        const count = getCategoryContentCount(categoryId);
        totalWords += count.words;
        totalQuestions += count.questions;
      }
    });

    return { words: totalWords, questions: totalQuestions };
  };

  const totalCount = getTotalCount();

  // Erişilebilir kategori sayısı
  const accessibleCount =
    Object.keys(CATEGORIES).filter(id => !CATEGORIES[id].isPremium || isPremium)
      .length +
    (isPremium ? Object.keys(state.customCategories || {}).length : 0);

  const allSelected = selectedCategories.length === accessibleCount;

  // Custom kategori sayısı
  const customCategoryCount = Object.keys(state.customCategories || {}).length;

  const categoryIds = Object.keys(CATEGORIES);
  const freeIds = categoryIds.filter(id => !CATEGORIES[id].isPremium);
  const premiumIds = categoryIds.filter(id => CATEGORIES[id].isPremium);

  const stats = [
    {
      icon: 'folder',
      color: colors.accentSecondary,
      value: selectedCategories.length,
      label: t('categorySelect.selected'),
    },
    {
      icon: 'text',
      color: colors.success,
      value: totalCount.words,
      label: t('categorySelect.words'),
    },
    {
      icon: 'help-circle',
      color: colors.warning,
      value: totalCount.questions,
      label: t('categorySelect.questions'),
    },
  ];

  // Izgara karosu - hazır ve özel kategoriler için ortak.
  const renderTile = ({
    id,
    name,
    icon,
    gradient,
    words,
    questions,
    isLocked,
    previewWords,
  }) => {
    const isSelected = selectedCategories.includes(id);
    const accent = gradient[gradient.length - 1];

    return (
      <GlassCard
        key={id}
        active={isSelected && !isLocked}
        activeColor={accent}
        style={[styles.tile, isLocked && styles.tileLocked]}
        onPress={() => toggleCategory(id)}
      >
        <View style={styles.tileTop}>
          <IconTile
            name={icon}
            size={44}
            gradient={isLocked ? LOCKED_GRADIENT : gradient}
            soft={!isSelected || isLocked}
          />
          {isLocked ? (
            <View style={styles.lockBadge}>
              <Icon name="lock-closed" size={12} color={colors.warning} />
            </View>
          ) : isSelected ? (
            <View style={[styles.check, { backgroundColor: accent }]}>
              <Icon name="checkmark" size={14} color={colors.textPrimary} />
            </View>
          ) : (
            <View style={styles.checkEmpty} />
          )}
        </View>

        <Text
          style={[
            styles.tileName,
            (isSelected || isLocked) && styles.tileNameStrong,
          ]}
          numberOfLines={2}
        >
          {name}
        </Text>

        <View style={styles.tileStats}>
          <Text style={styles.tileStat}>
            {words} {t('categorySelect.words')}
          </Text>
          {questions !== null && (
            <Text style={styles.tileStat}>
              {questions} {t('categorySelect.questions')}
            </Text>
          )}
        </View>

        {/* Kilitli kategorilerde ne kaçırıldığını göster - kelimeler
            bulanık, merak uyandırıp paywall'a tıklamayı artırıyor. */}
        {isLocked && (
          <View style={styles.lockedPreview}>
            {previewWords.map(wordKey => (
              <View key={wordKey} style={styles.lockedWordChip}>
                <Text style={styles.lockedWord} numberOfLines={1}>
                  {t(wordKey)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </GlassCard>
    );
  };

  const renderBuiltInTile = (categoryId, index) => {
    const category = CATEGORIES[categoryId];
    const count = getCategoryContentCount(categoryId);
    return renderTile({
      id: categoryId,
      name: t(`categories.${categoryId}`),
      icon: category.icon,
      gradient: TILE_GRADIENTS[index % TILE_GRADIENTS.length],
      words: count.words,
      questions: count.questions,
      isLocked: category.isPremium && !isPremium,
      previewWords: category.wordKeys.slice(0, 2),
    });
  };

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('categorySelect.title')}
          onBack={() => navigation.goBack()}
          right={
            <GradientButton
              title={t('categorySelect.save')}
              size="sm"
              onPress={handleSave}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* İstatistikler */}
          <View style={styles.statsRow}>
            {stats.map(stat => (
              <GlassCard key={stat.icon} style={styles.statCard}>
                <Icon name={stat.icon} size={16} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>
                  {stat.label}
                </Text>
              </GlassCard>
            ))}
          </View>

          {/* Kategorilerim */}
          <PressableScale
            scaleTo={0.98}
            onPress={() =>
              isPremium
                ? navigation.navigate('MyCategories')
                : navigation.navigate('Paywall', { onboarding: false })
            }
          >
            <LinearGradient
              colors={[
                withAlpha(colors.accentPrimary, 0.3),
                withAlpha(colors.accentPink, 0.14),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.myCategories}
            >
              <IconTile name="color-wand" size={46} gradient={gradients.brand} />
              <View style={styles.myCategoriesInfo}>
                <View style={styles.myCategoriesTitleRow}>
                  <Text style={styles.myCategoriesTitle}>
                    {t('categorySelect.myCategories')}
                  </Text>
                  {!isPremium && (
                    <View style={styles.proBadge}>
                      <Icon name="diamond" size={10} color={colors.warning} />
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.myCategoriesDesc} numberOfLines={2}>
                  {isPremium
                    ? customCategoryCount > 0
                      ? `${customCategoryCount} ${t(
                          'categorySelect.customCategoriesCount',
                        )}`
                      : t('categorySelect.noCustomCategories')
                    : t('categorySelect.createOwnCategories')}
                </Text>
              </View>
              <Icon
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </LinearGradient>
          </PressableScale>

          {/* Custom Kategoriler (Premium ve kategori varsa) */}
          {isPremium && customCategoryCount > 0 && (
            <>
              <SectionLabel
                icon="create"
                title={t('categorySelect.customCategories')}
                style={styles.sectionSpacing}
              />
              <View style={styles.grid}>
                {Object.values(state.customCategories).map((category, i) =>
                  renderTile({
                    id: category.id,
                    name: category.name,
                    icon: category.icon || 'folder',
                    gradient: TILE_GRADIENTS[(i + 5) % TILE_GRADIENTS.length],
                    words: category.words?.length || 0,
                    questions: null,
                    isLocked: false,
                    previewWords: [],
                  }),
                )}
              </View>
            </>
          )}

          {/* Ücretsiz Kategoriler */}
          <SectionLabel
            icon="gift"
            iconColor={colors.success}
            title={t('categorySelect.freeCategories')}
            style={styles.sectionSpacing}
            right={
              <PressableScale
                style={[
                  styles.selectAllChip,
                  allSelected && styles.selectAllChipActive,
                ]}
                onPress={allSelected ? deselectAll : selectAll}
              >
                <Icon
                  name={allSelected ? 'close-circle' : 'checkmark-done'}
                  size={14}
                  color={
                    allSelected ? colors.accentSecondary : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.selectAllText,
                    allSelected && styles.selectAllTextActive,
                  ]}
                >
                  {allSelected
                    ? t('categorySelect.deselectAll')
                    : t('categorySelect.selectAll')}
                </Text>
              </PressableScale>
            }
          />
          <View style={styles.grid}>{freeIds.map(renderBuiltInTile)}</View>

          {/* Premium Kategoriler */}
          <SectionLabel
            icon="diamond"
            iconColor={colors.warning}
            title={t('categorySelect.premiumCategories')}
            style={styles.sectionSpacing}
            right={
              !isPremium && (
                <View style={styles.proBadge}>
                  <Icon name="lock-closed" size={10} color={colors.warning} />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )
            }
          />
          <View style={styles.grid}>
            {premiumIds.map((id, i) => renderBuiltInTile(id, i + freeIds.length))}
          </View>

          <Text style={styles.footerText}>{t('categorySelect.hint')}</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  myCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: withAlpha(colors.accentPrimary, 0.45),
  },
  myCategoriesInfo: {
    flex: 1,
  },
  myCategoriesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  myCategoriesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  myCategoriesDesc: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(colors.warning, 0.16),
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.warning,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  selectAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectAllChipActive: {
    backgroundColor: withAlpha(colors.accentPrimary, 0.16),
    borderColor: withAlpha(colors.accentPrimary, 0.5),
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  selectAllTextActive: {
    color: colors.accentSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  tile: {
    width: '48.2%',
    padding: 14,
    borderWidth: 1.5,
  },
  tileLocked: {
    opacity: 0.85,
  },
  tileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkEmpty: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: withAlpha(colors.warning, 0.16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
    minHeight: 20,
  },
  tileNameStrong: {
    color: colors.textPrimary,
  },
  tileStats: {
    gap: 1,
  },
  tileStat: {
    fontSize: 12,
    color: colors.textMuted,
  },
  lockedPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  lockedWordChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  lockedWord: {
    fontSize: 11,
    fontWeight: '600',
    // Bulanıklık efekti: metnin kendisi şeffaf, gölgesi yayılarak çiziliyor.
    // Böylece ek bir native blur kütüphanesine ihtiyaç kalmıyor.
    color: 'transparent',
    textShadowColor: colors.textSecondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 24,
  },
});

export default CategorySelectScreen;
