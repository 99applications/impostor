import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
  BackHandler,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import InAppReview from 'react-native-in-app-review';
import { colors } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

// Paketler yüklenmezse ekranda takılı kalmamak için üst sınır (ms).
// Geliştirmede önizlemeye hızlı düşmek için daha kısa tutulur.
const PACKAGE_WAIT_TIMEOUT = __DEV__ ? 2500 : 8000;

const TERMS_URL = 'https://codeva.com.tr/imposter/terms';
const PRIVACY_URL = 'https://codeva.com.tr/imposter/privacy';

// Emülatörde ve Play Billing / StoreKit bulunmayan cihazlarda RevenueCat
// fiyatları çekemediği için offering boş gelir. Yalnızca __DEV__ altında
// ekranı bu örnek paketlerle çizeriz; üretimde asla kullanılmaz.
const PREVIEW_PACKAGES = {
  monthly: {
    packageType: 'MONTHLY',
    product: {
      identifier: 'premium_monthly',
      price: 4.99,
      currencyCode: 'USD',
      priceString: '$4.99',
    },
  },
  yearly: {
    packageType: 'ANNUAL',
    product: {
      identifier: 'premium_yearly',
      price: 29.99,
      currencyCode: 'USD',
      priceString: '$29.99',
    },
  },
};

// PremiumScreen'deki rakamlarla birebir aynı olmalı (premium.feature2* metinleri).
const PREMIUM_CATEGORY_COUNT = '22+';
const PREMIUM_WORD_COUNT = '2500+';

// Yıllık planın aylığa göre tasarrufunu yüzde olarak döndürür.
const getSavingsPercent = (monthlyPkg, yearlyPkg) => {
  const monthly = monthlyPkg?.product?.price;
  const yearly = yearlyPkg?.product?.price;
  if (!monthly || !yearly) return null;

  const percent = Math.round((1 - yearly / (monthly * 12)) * 100);
  return percent > 0 ? percent : null;
};

// Yıllık fiyatı "aylık karşılığı" olarak formatlar.
const getMonthlyEquivalent = yearlyPkg => {
  const price = yearlyPkg?.product?.price;
  const currency = yearlyPkg?.product?.currencyCode;
  if (!price || !currency) return null;

  const perMonth = price / 12;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(perMonth);
  } catch (e) {
    return `${perMonth.toFixed(2)} ${currency}`;
  }
};

const PaywallScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Onboarding akışında paywall kapatılınca Home'a geçilir; başka bir yerden
  // açıldıysa (ör. ayarlar) sadece geri dönülür.
  const isOnboarding = route?.params?.onboarding !== false;

  const {
    isPremium,
    isLoading,
    getPackage,
    purchaseProduct,
    restorePurchases,
  } = usePremium();

  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [waitedForPackages, setWaitedForPackages] = useState(false);

  const ctaScale = useRef(new Animated.Value(1)).current;
  const heroGlow = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(true);
  const hasLeft = useRef(false);
  // Satın alma bu ekranda tamamlandıysa çıkışı başarı uyarısı yönetir.
  const purchasedHere = useRef(false);

  const realMonthlyPkg = getPackage ? getPackage('monthly') : null;
  const realYearlyPkg = getPackage ? getPackage('yearly') : null;
  const hasRealPackages = !!(realMonthlyPkg || realYearlyPkg);

  // Gerçek paketler gelmediyse geliştirmede önizleme fiyatlarına düş.
  const isPreview = __DEV__ && !hasRealPackages && waitedForPackages;

  const monthlyPkg = hasRealPackages
    ? realMonthlyPkg
    : isPreview
    ? PREVIEW_PACKAGES.monthly
    : null;
  const yearlyPkg = hasRealPackages
    ? realYearlyPkg
    : isPreview
    ? PREVIEW_PACKAGES.yearly
    : null;

  const savingsPercent = getSavingsPercent(monthlyPkg, yearlyPkg);
  const monthlyEquivalent = getMonthlyEquivalent(yearlyPkg);
  const selectedPkg = selectedPlan === 'yearly' ? yearlyPkg : monthlyPkg;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Paketler hiç gelmezse kullanıcıyı boş ekranda tutmamak için zaman aşımı.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMounted.current) setWaitedForPackages(true);
    }, PACKAGE_WAIT_TIMEOUT);

    return () => clearTimeout(timer);
  }, []);

  // Giriş animasyonu + CTA nabız efekti + hero parıltısı.
  useEffect(() => {
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaScale, {
          toValue: 1.035,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ctaScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(heroGlow, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(heroGlow, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [contentFade, ctaScale, heroGlow]);

  // Ekrandan yalnızca bir kez çıkılır; çift yönlendirmeyi engeller.
  const leaveScreen = useCallback(() => {
    if (hasLeft.current) return;
    hasLeft.current = true;

    if (isOnboarding) {
      navigation.replace('Home');
    } else {
      navigation.goBack();
    }
  }, [isOnboarding, navigation]);

  // Kullanıcı ekrana zaten premium olarak geldiyse paywall gösterilmez.
  // Satın alma buradan yapıldıysa çıkışı başarı uyarısının OK'i tetikler.
  useEffect(() => {
    if (isPremium && !purchasedHere.current) {
      leaveScreen();
    }
  }, [isPremium, leaveScreen]);

  // Ürünler hiç yüklenemediyse (ağ yok / offering boş) ekranı gösterme.
  // Önizleme modunda ekran açık kalır ki tasarım geliştirilebilsin.
  useEffect(() => {
    if (!isPreview && waitedForPackages && !isLoading && !hasRealPackages) {
      leaveScreen();
    }
  }, [isPreview, waitedForPackages, isLoading, hasRealPackages, leaveScreen]);

  // Satın alma sürerken geri tuşu ekranı kapatmasın.
  useEffect(() => {
    const onBackPress = () => {
      if (isPurchasing) return true;
      handleClose();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
    // handleClose stabil olmadığı için bilinçli olarak isPurchasing'e bağlıyoruz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPurchasing]);

  const handlePurchase = async () => {
    if (isPurchasing) return;

    // Önizlemede gerçek ürün yok; anlamsız bir mağaza hatası göstermek yerine
    // durumu açıkça belirt.
    if (isPreview) {
      Alert.alert(
        'Önizleme modu',
        'Bu cihazda Play Billing / StoreKit yok, bu yüzden fiyatlar örnektir ve satın alma yapılamaz. Gerçek test için Play Store içeren bir emülatör ya da gerçek cihaz kullan.',
      );
      return;
    }

    if (!selectedPkg) {
      Alert.alert(t('common.error'), t('premium.planNotFound'));
      return;
    }

    setIsPurchasing(true);
    // purchaseProduct içeride isPremium'u güncelliyor; otomatik çıkış
    // devreye girmesin diye bayrağı önceden kaldırıyoruz.
    purchasedHere.current = true;

    const result = await purchaseProduct(selectedPlan);
    if (!isMounted.current) return;
    setIsPurchasing(false);

    if (!result.success) {
      purchasedHere.current = false;
    }

    if (result.success) {
      if (InAppReview.isAvailable()) {
        InAppReview.RequestInAppReview();
      }
      Alert.alert(t('premium.successTitle'), t('premium.successMessage'), [
        { text: t('common.ok'), onPress: leaveScreen },
      ]);
    } else if (result.cancelled) {
      // Kullanıcı iptal etti, ekranda kal.
    } else {
      Alert.alert(
        t('common.error'),
        result.error || t('premium.purchaseFailed'),
      );
    }
  };

  const handleRestore = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    const result = await restorePurchases();
    if (!isMounted.current) return;
    setIsPurchasing(false);

    if (result.success) {
      Alert.alert(
        result.restored
          ? t('premium.restoreSuccessTitle')
          : t('premium.restoreTitle'),
        result.message,
      );
    } else {
      Alert.alert(t('common.error'), result.error);
    }
  };

  const handleClose = () => {
    if (isPurchasing) return;
    leaveScreen();
  };

  // Metinler PremiumScreen ile birebir aynı olsun diye mevcut premium.* anahtarları kullanılır.
  const benefits = [
    { icon: 'grid', text: t('premium.feature2Title') },
    { icon: 'text', text: t('premium.feature2Desc') },
    { icon: 'color-wand', text: t('premium.feature1Title') },
    { icon: 'ban', text: t('premium.feature4Title') },
    { icon: 'sparkles', text: t('premium.feature3Title') },
  ];

  const plans = [
    {
      id: 'yearly',
      pkg: yearlyPkg,
      title: t('paywall.yearlyTitle'),
      subtitle: monthlyEquivalent
        ? t('paywall.perMonth', { price: monthlyEquivalent })
        : t('paywall.yearlySubtitle'),
      badge: savingsPercent
        ? t('paywall.savePercent', { percent: savingsPercent })
        : t('paywall.bestValue'),
    },
    {
      id: 'monthly',
      pkg: monthlyPkg,
      title: t('paywall.monthlyTitle'),
      subtitle: null,
      badge: null,
    },
  ].filter(plan => plan.pkg);

  // Seçili plan offering'de yoksa mevcut olan diğer plana geç.
  useEffect(() => {
    if (selectedPlan === 'yearly' && !yearlyPkg && monthlyPkg) {
      setSelectedPlan('monthly');
    } else if (selectedPlan === 'monthly' && !monthlyPkg && yearlyPkg) {
      setSelectedPlan('yearly');
    }
  }, [selectedPlan, yearlyPkg, monthlyPkg]);

  const ctaLabel = t('paywall.cta');

  // Paketler yüklenirken kısa bir bekleme ekranı.
  if (!hasRealPackages && !waitedForPackages) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const glowScale = heroGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.18],
  });
  const glowOpacity = heroGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.08],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bgGradient} />
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Kapatma butonu - ekran açılır açılmaz görünür */}
      <View style={[styles.closeWrapper, { top: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={handleClose}
        >
          <Icon name="close" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.flex, { opacity: contentFade }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 56 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sadece geliştirmede: fiyatların örnek olduğunu belli et */}
          {isPreview && (
            <View style={styles.previewBanner}>
              <Icon name="construct" size={14} color={colors.warning} />
              <Text style={styles.previewBannerText}>
                ÖNİZLEME · Play Billing yok, fiyatlar örnektir
              </Text>
            </View>
          )}

          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroIconWrapper}>
              <Animated.View
                style={[
                  styles.heroGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{ scale: glowScale }],
                  },
                ]}
              />
              <View style={styles.heroIcon}>
                <Icon name="diamond" size={38} color={colors.textPrimary} />
              </View>
            </View>

            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>{t('paywall.proLabel')}</Text>
            </View>

            <Text style={styles.heroTitle}>{t('paywall.title')}</Text>
            <Text style={styles.heroSubtitle}>{t('paywall.subtitle')}</Text>
          </View>

          {/* İçerik özeti - rakamlar PremiumScreen ile birebir aynı */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{PREMIUM_CATEGORY_COUNT}</Text>
              <Text style={styles.statLabel}>
                {t('paywall.statCategories')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{PREMIUM_WORD_COUNT}</Text>
              <Text style={styles.statLabel}>{t('paywall.statWords')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>∞</Text>
              <Text style={styles.statLabel}>{t('paywall.statCustom')}</Text>
            </View>
          </View>

          {/* Avantajlar */}
          <View style={styles.benefitsCard}>
            {benefits.map((benefit, index) => (
              <View
                key={benefit.icon}
                style={[
                  styles.benefitRow,
                  index === benefits.length - 1 && styles.benefitRowLast,
                ]}
              >
                <View style={styles.benefitCheck}>
                  <Icon name="checkmark" size={14} color={colors.textPrimary} />
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.legalText}>{t('paywall.legalText')}</Text>
        </ScrollView>

        {/* Sabit alt bölüm: planlar + CTA */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.plansRow}>
            {plans.map(plan => {
              const isSelected = selectedPlan === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[styles.planCard, isSelected && styles.planCardActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {!!plan.badge && (
                    <View
                      style={[
                        styles.planBadge,
                        isSelected && styles.planBadgeActive,
                      ]}
                    >
                      <Text style={styles.planBadgeText}>{plan.badge}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.planTitle,
                      isSelected && styles.planTitleActive,
                    ]}
                  >
                    {plan.title}
                  </Text>
                  <Text
                    style={[
                      styles.planPrice,
                      isSelected && styles.planPriceActive,
                    ]}
                  >
                    {plan.pkg?.product?.priceString}
                  </Text>
                  <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <TouchableOpacity
              style={[styles.cta, isPurchasing && styles.ctaDisabled]}
              activeOpacity={0.9}
              onPress={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <>
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                  <Icon
                    name="arrow-forward"
                    size={20}
                    color={colors.textPrimary}
                  />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.reassuranceRow}>
            <Icon name="shield-checkmark" size={13} color={colors.success} />
            <Text style={styles.reassuranceText}>
              {t('paywall.cancelAnytime')}
            </Text>
          </View>

          <View style={styles.linksRow}>
            <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
              <Text style={styles.linkText}>
                {t('premium.restorePurchase')}
              </Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
              <Text style={styles.linkText}>{t('premium.termsOfUse')}</Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
              <Text style={styles.linkText}>{t('premium.privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 340,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  bgCircle1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    top: -80,
    right: -70,
  },
  bgCircle2: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    top: 180,
    left: -60,
  },
  closeWrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  previewBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.warning,
    letterSpacing: 0.3,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  heroIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroGlow: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.accentPrimary,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  proBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: colors.warning,
  },
  heroTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accentSecondary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  benefitsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  benefitRowLast: {
    borderBottomWidth: 0,
  },
  benefitCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 14.5,
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  legalText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  planCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.10)',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    backgroundColor: colors.bgCardLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  planBadgeActive: {
    backgroundColor: colors.warning,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  planTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  planTitleActive: {
    color: colors.textPrimary,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  planPriceActive: {
    color: colors.accentSecondary,
  },
  planSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 17,
    borderRadius: 16,
    gap: 10,
    minHeight: 56,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  reassuranceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  linkText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  linkDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: 10,
  },
});

export default PaywallScreen;
