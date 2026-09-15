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
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import InAppReview from 'react-native-in-app-review';
import { colors } from '../theme/colors';
import { usePremium } from '../context/PremiumContext';

const PAYWALL_BACK = require('../assets/png/paywallBack.png');
// paywallBack.png'nin düz zemin rengi; küçültülen görselin kenarları belli olmasın.
const PAYWALL_BG = '#08050E';
const PAYWALL_BACK_RATIO = 800 / 380;
// Çizim görselin üst %45'inde, altı düz zemin.
const PAYWALL_ART_BOTTOM = 0.45;

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const IS_COMPACT = WINDOW_HEIGHT < 720;

const HERO_HEIGHT = Math.round(WINDOW_HEIGHT * (IS_COMPACT ? 0.2 : 0.26));
const HERO_IMAGE_WIDTH = Math.min(
  WINDOW_WIDTH,
  Math.round(HERO_HEIGHT / (PAYWALL_ART_BOTTOM * PAYWALL_BACK_RATIO)),
);

// Reklamsız kartının altında listelenen avantajlar.
const FEATURES = [
  {
    icon: 'grid-outline',
    titleKey: 'premium.feature2Title',
    descKey: 'premium.feature2Desc',
  },
  {
    icon: 'create-outline',
    titleKey: 'premium.feature1Title',
    descKey: 'premium.feature1Desc',
  },
];

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

  // Giriş animasyonu + CTA nabız efekti.
  useEffect(() => {
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ctaScale, {
          toValue: 1.025,
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

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [contentFade, ctaScale]);

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
    console.log('selectedPkg: ', selectedPkg);

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
      subtitle: monthlyPkg?.product?.priceString
        ? t('paywall.perMonth', { price: monthlyPkg.product.priceString })
        : null,
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
  const titleMid = t('paywall.titleMid', { defaultValue: '' });
  const titleAfter = t('paywall.titleAfter', { defaultValue: '' });

  const renderBackground = children => (
    <View style={styles.background}>{children}</View>
  );

  // Paketler yüklenirken kısa bir bekleme ekranı.
  if (!hasRealPackages && !waitedForPackages) {
    return renderBackground(
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accentSecondary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>,
    );
  }

  return renderBackground(
    <View style={styles.flex}>
      <View style={[styles.closeWrapper, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onPress={handleClose}
        >
          <Icon name="close" size={18} color="rgba(255,255,255,0.55)" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.flex, { opacity: contentFade }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 12) + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.hero, { height: insets.top + HERO_HEIGHT }]}>
            <Image
              source={PAYWALL_BACK}
              style={[styles.heroImage, { top: insets.top }]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(8,5,14,0)', PAYWALL_BG]}
              style={styles.heroFade}
            />
          </View>

          <View style={styles.sheet}>
            {isPreview && (
              <View style={styles.previewBanner}>
                <Icon name="construct" size={14} color={colors.warning} />
                <Text style={styles.previewBannerText}>
                  ÖNİZLEME · Play Billing yok, fiyatlar örnektir
                </Text>
              </View>
            )}

            <Text style={styles.proLabel}>{t('paywall.proLabel')}</Text>

            <Text style={styles.heroTitle}>
              {t('paywall.title')}
              {'\n'}
              {titleMid ? `${titleMid} ` : ''}
              <Text style={styles.heroTitleAccent}>
                {t('paywall.titleHighlight')}
              </Text>
              {titleAfter ? ` ${titleAfter}` : ''}
            </Text>

            <LinearGradient
              colors={['rgba(236,72,153,0.26)', 'rgba(168,85,247,0.10)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.adFreeCard}
            >
              <View style={styles.adFreeIcon}>
                <Icon name="ban" size={26} color="#ffffff" />
              </View>
              <View style={styles.featureCopy}>
                <Text style={styles.adFreeTitle}>
                  {t('premium.feature4Title')}
                </Text>
                <Text style={styles.adFreeDesc}>{t('premium.feature4Desc')}</Text>
              </View>
              <Icon name="checkmark-circle" size={26} color="#EC4899" />
            </LinearGradient>

            <View style={styles.featureList}>
              {FEATURES.map(feature => (
                <View key={feature.titleKey} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Icon name={feature.icon} size={18} color="#C084FC" />
                  </View>
                  <View style={styles.featureCopy}>
                    <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                    <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.plansColumn}>
              {plans.map(plan => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planRow,
                      isSelected && styles.planRowActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPlan(plan.id)}
                  >
                    <View
                      style={[
                        styles.radio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>

                    <View style={styles.planCopy}>
                      <Text
                        style={[
                          styles.planTitle,
                          isSelected && styles.planTitleActive,
                        ]}
                      >
                        {plan.title}
                      </Text>
                      {!!plan.subtitle && (
                        <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                      )}
                    </View>

                    <View style={styles.planPricing}>
                      <Text
                        style={[
                          styles.planPrice,
                          isSelected && styles.planPriceActive,
                        ]}
                      >
                        {plan.pkg?.product?.priceString}
                      </Text>
                      {!!plan.badge && (
                        <View style={styles.planBadge}>
                          <Text style={styles.planBadgeText}>{plan.badge}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.cancelAnytime}>{t('paywall.cancelAnytime')}</Text>

            <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
              <TouchableOpacity
                style={[styles.cta, isPurchasing && styles.ctaDisabled]}
                activeOpacity={0.9}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator size="large" color="#ffffff" />
                ) : (
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.linksRow}>
              <TouchableOpacity onPress={handleRestore} disabled={isPurchasing}>
                <Text style={styles.linkText}>{t('paywall.restore')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
                <Text style={styles.linkText}>{t('paywall.terms')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
                <Text style={styles.linkText}>{t('paywall.privacy')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>,
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: PAYWALL_BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textSecondary,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    left: Math.round((WINDOW_WIDTH - HERO_IMAGE_WIDTH) / 2),
    width: HERO_IMAGE_WIDTH,
    height: Math.round(HERO_IMAGE_WIDTH * PAYWALL_BACK_RATIO),
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  sheet: {
    paddingHorizontal: 22,
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
  proLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.2,
    color: '#A855F7',
    textAlign: 'center',
    marginBottom: IS_COMPACT ? 10 : 14,
  },
  heroTitle: {
    fontSize: IS_COMPACT ? 28 : 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: IS_COMPACT ? 34 : 38,
    letterSpacing: -0.6,
    marginBottom: IS_COMPACT ? 14 : 18,
  },
  heroTitleAccent: {
    color: '#EC4899',
  },
  adFreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.6)',
    paddingVertical: IS_COMPACT ? 12 : 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  adFreeIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adFreeTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
  },
  adFreeDesc: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
  },
  featureList: {
    gap: IS_COMPACT ? 8 : 10,
    paddingHorizontal: 4,
    marginBottom: IS_COMPACT ? 14 : 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  featureDesc: {
    marginTop: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  plansColumn: {
    gap: 10,
    marginBottom: IS_COMPACT ? 16 : 20,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  planRowActive: {
    borderWidth: 1,
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#A855F7',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A855F7',
  },
  planCopy: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
  },
  planTitleActive: {
    color: '#ffffff',
  },
  planSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
  },
  planPricing: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
  },
  planPriceActive: {
    color: '#ffffff',
  },
  planBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
  },
  cancelAnytime: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    marginBottom: 10,
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A855F7',
    paddingVertical: 17,
    borderRadius: 999,
    minHeight: 56,
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    fontSize: 25,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    marginTop: 10,
  },
  linkText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.32)',
  },
});

export default PaywallScreen;
