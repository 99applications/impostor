import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import { CATEGORIES, getCategoryContentCount } from '../data/gameData';

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

    // Premium kategori kontrolü
    if (category.isPremium && !isPremium) {
      Alert.alert(
        t('categorySelect.premiumTitle'),
        t('categorySelect.premiumMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('categorySelect.goPremium'),
            onPress: () => navigation.navigate('Premium'),
          },
        ],
      );
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
    setLocalSelectedCategories(accessibleCategories);
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
      const count = getCategoryContentCount(categoryId);
      totalWords += count.words;
      totalQuestions += count.questions;
    });

    return { words: totalWords, questions: totalQuestions };
  };

  const totalCount = getTotalCount();

  // Erişilebilir kategori sayısı
  const accessibleCount = Object.keys(CATEGORIES).filter(
    id => !CATEGORIES[id].isPremium || isPremium,
  ).length;

  const allSelected = selectedCategories.length === accessibleCount;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('categorySelect.title')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('categorySelect.save')}</Text>
        </TouchableOpacity>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Icon name="folder-outline" size={18} color={colors.accentPrimary} />
          <Text style={styles.infoText}>
            {selectedCategories.length} {t('categorySelect.selected')}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Icon name="document-text-outline" size={18} color={colors.success} />
          <Text style={styles.infoText}>
            {totalCount.words} {t('categorySelect.words')}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoItem}>
          <Icon name="help-circle-outline" size={18} color={colors.warning} />
          <Text style={styles.infoText}>
            {totalCount.questions} {t('categorySelect.questions')}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickButton, allSelected && styles.quickButtonActive]}
          onPress={allSelected ? deselectAll : selectAll}
        >
          <Icon
            name={
              allSelected ? 'close-circle-outline' : 'checkmark-circle-outline'
            }
            size={20}
            color={allSelected ? colors.accentPrimary : colors.textSecondary}
          />
          <Text
            style={[
              styles.quickButtonText,
              allSelected && styles.quickButtonTextActive,
            ]}
          >
            {allSelected
              ? t('categorySelect.deselectAll')
              : t('categorySelect.selectAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Free Categories Section */}
        <View style={styles.sectionHeader}>
          <Icon name="gift-outline" size={20} color={colors.success} />
          <Text style={styles.sectionTitle}>
            {t('categorySelect.freeCategories')}
          </Text>
        </View>

        {Object.keys(CATEGORIES)
          .filter(id => !CATEGORIES[id].isPremium)
          .map(categoryId => renderCategoryCard(categoryId))}

        {/* Premium Categories Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Icon name="diamond-outline" size={20} color={colors.warning} />
          <Text style={styles.sectionTitle}>
            {t('categorySelect.premiumCategories')}
          </Text>
          {!isPremium && (
            <View style={styles.premiumBadge}>
              <Icon name="lock-closed" size={12} color={colors.warning} />
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </View>

        {Object.keys(CATEGORIES)
          .filter(id => CATEGORIES[id].isPremium)
          .map(categoryId => renderCategoryCard(categoryId))}
      </ScrollView>

      {/* Footer Hint */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.footerText}>{t('categorySelect.hint')}</Text>
      </View>
    </View>
  );

  // Kategori kartı render fonksiyonu
  function renderCategoryCard(categoryId) {
    const category = CATEGORIES[categoryId];
    const isSelected = selectedCategories.includes(categoryId);
    const isLocked = category.isPremium && !isPremium;
    const count = getCategoryContentCount(categoryId);

    return (
      <TouchableOpacity
        key={categoryId}
        style={[
          styles.categoryCard,
          isSelected && styles.categoryCardActive,
          isLocked && styles.categoryCardLocked,
        ]}
        activeOpacity={0.7}
        onPress={() => toggleCategory(categoryId)}
      >
        {/* Left - Icon and Info */}
        <View style={styles.categoryLeft}>
          <View
            style={[
              styles.categoryIcon,
              isSelected && styles.categoryIconActive,
              isLocked && styles.categoryIconLocked,
            ]}
          >
            <Icon
              name={category.icon}
              size={26}
              color={
                isLocked
                  ? colors.textMuted
                  : isSelected
                  ? colors.textPrimary
                  : colors.textSecondary
              }
            />
          </View>
          <View style={styles.categoryInfo}>
            <View style={styles.categoryNameRow}>
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameActive,
                  isLocked && styles.categoryNameLocked,
                ]}
              >
                {t(`categories.${categoryId}`)}
              </Text>
              {isLocked && (
                <Icon
                  name="lock-closed"
                  size={14}
                  color={colors.warning}
                  style={{ marginLeft: 6 }}
                />
              )}
            </View>
            <View style={styles.categoryStats}>
              <Text
                style={[
                  styles.categoryStat,
                  isLocked && styles.categoryStatLocked,
                ]}
              >
                <Icon
                  name="document-text-outline"
                  size={12}
                  color={isLocked ? colors.textMuted : colors.textMuted}
                />{' '}
                {count.words} {t('categorySelect.words')}
              </Text>
              <Text
                style={[
                  styles.categoryStatDivider,
                  isLocked && styles.categoryStatLocked,
                ]}
              >
                •
              </Text>
              <Text
                style={[
                  styles.categoryStat,
                  isLocked && styles.categoryStatLocked,
                ]}
              >
                <Icon
                  name="help-circle-outline"
                  size={12}
                  color={isLocked ? colors.textMuted : colors.textMuted}
                />{' '}
                {count.questions} {t('categorySelect.questions')}
              </Text>
            </View>
          </View>
        </View>

        {/* Right - Checkbox */}
        <View
          style={[
            styles.checkbox,
            isSelected && styles.checkboxActive,
            isLocked && styles.checkboxLocked,
          ]}
        >
          {isSelected && !isLocked && (
            <Icon name="checkmark" size={18} color={colors.textPrimary} />
          )}
          {isLocked && (
            <Icon name="lock-closed" size={14} color={colors.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: colors.accentPrimary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickButtonTextActive: {
    color: colors.accentPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  categoryCardLocked: {
    opacity: 0.7,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryIconActive: {
    backgroundColor: colors.accentPrimary,
  },
  categoryIconLocked: {
    backgroundColor: colors.bgCardLight,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  categoryNameActive: {
    color: colors.textPrimary,
  },
  categoryNameLocked: {
    color: colors.textMuted,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStat: {
    fontSize: 12,
    color: colors.textMuted,
  },
  categoryStatLocked: {
    color: colors.textMuted,
    opacity: 0.7,
  },
  categoryStatDivider: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  checkboxLocked: {
    backgroundColor: colors.bgCardLight,
    borderColor: colors.border,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CategorySelectScreen;
