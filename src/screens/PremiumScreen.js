import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const PremiumScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // clearPremium fonksiyonunu buradan aldık
  const {
    isPremium,
    premiumType,
    activatePremium,
    getDaysRemaining,
    clearPremium,
  } = usePremium();

  const plans = [
    {
      id: 'monthly',
      titleKey: 'premium.monthlyTitle',
      subtitleKey: 'premium.monthlySubtitle',
      price: '₺129,99',
    },
    {
      id: 'lifetime',
      titleKey: 'premium.lifetimeTitle',
      subtitleKey: 'premium.lifetimeSubtitle',
      price: '₺399,99',
    },
  ];

  const features = [
    {
      icon: 'layers-outline',
      titleKey: 'premium.feature1Title',
      descKey: 'premium.feature1Desc',
      tags: [
        'premium.tagOffice',
        'premium.tagFamily',
        'premium.tagTravel',
        'premium.tagFriends',
      ],
    },
    {
      icon: 'grid-outline',
      titleKey: 'premium.feature2Title',
      descKey: 'premium.feature2Desc',
    },
    {
      icon: 'color-wand-outline',
      titleKey: 'premium.feature3Title',
      descKey: 'premium.feature3Desc',
    },
    {
      icon: 'ban-outline',
      titleKey: 'premium.feature4Title',
      descKey: 'premium.feature4Desc',
    },
  ];

  // Abonelik iptal fonksiyonu
  const handleCancelSubscription = () => {
    Alert.alert(
      t('premium.cancelTitle') || 'Aboneliği İptal Et',
      t('premium.cancelMessage') ||
        'Premium özelliklerini kaybetmek istediğine emin misin?',
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            await clearPremium();
            Alert.alert('Bilgi', 'Abonelik iptal edildi.');
          },
        },
      ],
    );
  };

  const handlePurchase = async () => {
    Alert.alert(t('premium.confirmTitle'), t('premium.confirmMessage'), [
      {
        text: t('common.cancel'),
        style: 'cancel',
      },
      {
        text: t('common.confirm'),
        onPress: async () => {
          const success = await activatePremium(selectedPlan);
          if (success) {
            Alert.alert(
              t('premium.successTitle'),
              t('premium.successMessage'),
              [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
            );
          }
        },
      },
    ]);
  };

  const handleRestorePurchase = () => {
    Alert.alert(t('premium.restoreTitle'), t('premium.restoreMessage'));
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  // Eğer zaten premium ise farklı UI göster
  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Background Effects */}
        <View style={styles.bgGradient} />
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('premium.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Premium Active Content */}
        <View style={styles.premiumActiveContainer}>
          <View style={styles.premiumActiveIconWrapper}>
            <View style={styles.premiumActiveIconBg}>
              <Icon name="checkmark-circle" size={72} color={colors.success} />
            </View>
          </View>

          <Text style={styles.premiumActiveTitle}>
            {t('premium.alreadyPremium')}
          </Text>

          <Text style={styles.premiumActiveSubtitle}>
            {premiumType === 'lifetime'
              ? t('premium.lifetimeActive')
              : t('premium.daysRemaining', { days: getDaysRemaining() })}
          </Text>

          <View style={styles.premiumBadge}>
            <Icon name="diamond" size={18} color={colors.warning} />
            <Text style={styles.premiumBadgeText}>
              {premiumType === 'lifetime'
                ? t('premium.lifetimeBadge')
                : t('premium.monthlyBadge')}
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.activeFeaturesList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.activeFeatureItem}>
                <Icon name="checkmark" size={20} color={colors.success} />
                <Text style={styles.activeFeatureText}>
                  {t(feature.titleKey)}
                </Text>
              </View>
            ))}
          </View>

          {/* İPTAL BUTONU */}
          <TouchableOpacity
            style={styles.cancelSubscriptionButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelSubscriptionText}>
              Aboneliği İptal Et (Test)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Normal Premium Screen (henüz premium değil)
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Background Effects */}
      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('premium.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Icon name="diamond" size={40} color={colors.accentPrimary} />
          </View>
          <Text style={styles.heroTitle}>{t('premium.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('premium.heroSubtitle')}</Text>
        </View>

        {/* Plan Selection */}
        <View style={styles.plansSection}>
          {plans.map(plan => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={styles.planLeft}>
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonActive,
                    ]}
                  >
                    {isSelected && (
                      <Icon
                        name="checkmark"
                        size={16}
                        color={colors.textPrimary}
                      />
                    )}
                  </View>
                  <View style={styles.planInfo}>
                    <Text
                      style={[
                        styles.planTitle,
                        isSelected && styles.planTitleActive,
                      ]}
                    >
                      {t(plan.titleKey)}
                    </Text>
                    <Text style={styles.planSubtitle}>
                      {t(plan.subtitleKey)}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.planPrice,
                    isSelected && styles.planPriceActive,
                  ]}
                >
                  {plan.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Purchase Button */}
        <TouchableOpacity
          style={styles.purchaseButton}
          activeOpacity={0.8}
          onPress={handlePurchase}
        >
          <Text style={styles.purchaseButtonText}>
            {t('premium.purchaseButton')} • {selectedPlanData?.price}
          </Text>
        </TouchableOpacity>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>{t('premium.whatsIncluded')}</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name={feature.icon}
                  size={24}
                  color={colors.accentPrimary}
                />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
                {feature.tags && (
                  <View style={styles.featureTags}>
                    {feature.tags.map((tagKey, tagIndex) => (
                      <View key={tagIndex} style={styles.featureTag}>
                        <Text style={styles.featureTagText}>{t(tagKey)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Links */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity onPress={handleRestorePurchase}>
          <Text style={styles.footerLink}>{t('premium.restorePurchase')}</Text>
        </TouchableOpacity>
        <View style={styles.footerDivider} />
        <TouchableOpacity
          onPress={() => Linking.openURL('https://example.com/terms')}
        >
          <Text style={styles.footerLink}>{t('premium.termsOfUse')}</Text>
        </TouchableOpacity>
        <View style={styles.footerDivider} />
        <TouchableOpacity
          onPress={() => Linking.openURL('https://example.com/privacy')}
        >
          <Text style={styles.footerLink}>{t('premium.privacyPolicy')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  bgCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    top: -50,
    right: -50,
  },
  bgCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    top: 200,
    left: -30,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  plansSection: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.border,
  },
  planCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioButtonActive: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  planTitleActive: {
    color: colors.textPrimary,
  },
  planSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  planPriceActive: {
    color: colors.accentPrimary,
  },
  purchaseButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  purchaseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  featuresSection: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  featureTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureTag: {
    backgroundColor: colors.bgCardLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  featureTagText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  footerLink: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footerDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  premiumActiveContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  premiumActiveIconWrapper: {
    marginBottom: 24,
  },
  premiumActiveIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  premiumActiveTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumActiveSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    gap: 8,
    marginBottom: 32,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  activeFeaturesList: {
    width: '100%',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
  },
  activeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activeFeatureText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  // Yeni eklenen stil
  cancelSubscriptionButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: 'transparent',
  },
  cancelSubscriptionText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PremiumScreen;
