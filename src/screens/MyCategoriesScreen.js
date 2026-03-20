import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';

const MyCategoriesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state } = useGame();
  const { isPremium } = usePremium();

  const customCategories = Object.values(state.customCategories || {});

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
        <Text style={styles.headerTitle}>{t('myCategories.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CustomCategory')}
        >
          <Icon name="add" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Banner (premium değilse) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Premium')}
          >
            <View style={styles.premiumBannerIcon}>
              <Icon name="diamond" size={24} color={colors.warning} />
            </View>
            <View style={styles.premiumBannerInfo}>
              <Text style={styles.premiumBannerTitle}>
                {t('myCategories.premiumTitle')}
              </Text>
              <Text style={styles.premiumBannerDesc}>
                {t('myCategories.premiumDesc')}
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={colors.warning} />
          </TouchableOpacity>
        )}

        {/* Kategori Listesi */}
        {customCategories.length > 0 ? (
          <View style={styles.categoryList}>
            {customCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigation.navigate('CustomCategory', { category })
                }
              >
                <View style={styles.categoryIcon}>
                  <Icon
                    name={category.icon || 'folder'}
                    size={26}
                    color={colors.textPrimary}
                  />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {category.words?.length || 0} {t('categorySelect.words')}
                  </Text>
                </View>
                <Icon
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon
                name="folder-open-outline"
                size={64}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {t('myCategories.emptyTitle')}
            </Text>
            <Text style={styles.emptyDesc}>{t('myCategories.emptyDesc')}</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CustomCategory')}
            >
              <Icon name="add" size={20} color={colors.textPrimary} />
              <Text style={styles.createButtonText}>
                {t('myCategories.create')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  premiumBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumBannerInfo: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
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
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default MyCategoriesScreen;
