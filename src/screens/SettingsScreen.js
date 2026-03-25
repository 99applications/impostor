import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';
import { usePremium } from '../context/PremiumContext';

const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXXX'; // App Store ID'ni ekle
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.impostor';
const SUPPORT_EMAIL = 'imposter@codeva.com.tr';
const PRIVACY_URL = 'https://codeva.com.tr/imposter/privacy';
const TERMS_URL = 'https://codeva.com.tr/imposter/terms';

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isPremium, premiumType, getDaysRemaining } = usePremium();

  const handleLanguageChange = async langCode => {
    await changeLanguage(langCode);
  };

  // Uygulamayı puanla
  const handleRateApp = () => {
    const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(storeUrl).catch(() => {
      Alert.alert(t('settings.error'), t('settings.cantOpenStore'));
    });
  };

  // Uygulamayı paylaş
  const handleShareApp = async () => {
    try {
      const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
      await Share.share({
        message: t('settings.shareMessage', { url: storeUrl }),
        title: t('app.name'),
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  // Geri bildirim gönder
  const handleFeedback = () => {
    const subject = encodeURIComponent(
      `${t('app.name')} - ${t('settings.feedback')}`,
    );
    const body = encodeURIComponent(
      `\n\n---\nApp Version: 1.0.0\nPlatform: ${Platform.OS}\n`,
    );
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`,
    ).catch(() => {
      Alert.alert(t('settings.error'), t('settings.cantOpenEmail'));
    });
  };

  // Gizlilik politikası
  const handlePrivacy = () => {
    Linking.openURL(PRIVACY_URL).catch(() => {
      Alert.alert(t('settings.error'), t('settings.cantOpenLink'));
    });
  };

  // Kullanım şartları
  const handleTerms = () => {
    Linking.openURL(TERMS_URL).catch(() => {
      Alert.alert(t('settings.error'), t('settings.cantOpenLink'));
    });
  };

  // Premium durumu metni
  const getPremiumStatusText = () => {
    if (!isPremium) return t('settings.getPremium');
    if (premiumType === 'lifetime') return t('settings.lifetimeMember');
    const days = getDaysRemaining();
    return t('settings.daysLeft', { days });
  };

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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Kartı */}
        <TouchableOpacity
          style={[styles.premiumCard, isPremium && styles.premiumCardActive]}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Premium')}
        >
          <View style={styles.premiumCardLeft}>
            <View
              style={[
                styles.premiumIcon,
                isPremium && styles.premiumIconActive,
              ]}
            >
              <Icon
                name={isPremium ? 'diamond' : 'diamond-outline'}
                size={28}
                color={isPremium ? colors.warning : colors.textSecondary}
              />
            </View>
            <View style={styles.premiumInfo}>
              <Text style={styles.premiumTitle}>
                {isPremium
                  ? t('settings.premiumActive')
                  : t('settings.premium')}
              </Text>
              <Text
                style={[
                  styles.premiumStatus,
                  isPremium && styles.premiumStatusActive,
                ]}
              >
                {getPremiumStatusText()}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Dil Seçimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="language-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          </View>

          <View style={styles.languageList}>
            {SUPPORTED_LANGUAGES.map((lang, index) => {
              const isSelected = i18n.language === lang.code;
              const isLast = index === SUPPORTED_LANGUAGES.length - 1;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemActive,
                    isLast && styles.languageItemLast,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      isSelected && styles.languageNameActive,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Icon
                        name="checkmark"
                        size={16}
                        color={colors.textPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Destek */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="heart-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
          </View>

          <View style={styles.menuList}>
            {/* Puanla */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleRateApp}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: 'rgba(251, 191, 36, 0.15)' },
                  ]}
                >
                  <Icon name="star" size={20} color={colors.warning} />
                </View>
                <Text style={styles.menuItemText}>{t('settings.rateApp')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Paylaş */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleShareApp}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
                  ]}
                >
                  <Icon name="share-social" size={20} color={colors.success} />
                </View>
                <Text style={styles.menuItemText}>
                  {t('settings.shareApp')}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Geri Bildirim */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={handleFeedback}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: 'rgba(139, 92, 246, 0.15)' },
                  ]}
                >
                  <Icon name="mail" size={20} color={colors.accentPrimary} />
                </View>
                <Text style={styles.menuItemText}>
                  {t('settings.feedback')}
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Yasal */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="document-text-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>{t('settings.legal')}</Text>
          </View>

          <View style={styles.menuList}>
            {/* Gizlilik Politikası */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handlePrivacy}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: 'rgba(100, 116, 139, 0.15)' },
                  ]}
                >
                  <Icon
                    name="shield-checkmark-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={styles.menuItemText}>{t('settings.privacy')}</Text>
              </View>
              <Icon name="open-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Kullanım Şartları */}
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              activeOpacity={0.7}
              onPress={handleTerms}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: 'rgba(100, 116, 139, 0.15)' },
                  ]}
                >
                  <Icon
                    name="document-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={styles.menuItemText}>{t('settings.terms')}</Text>
              </View>
              <Icon name="open-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Uygulama Bilgisi */}
        <View style={styles.appInfoSection}>
          <View style={styles.appLogoWrapper}>
            <View style={styles.appLogo}>
              <Icon name="people" size={32} color={colors.accentPrimary} />
            </View>
          </View>
          <Text style={styles.appName}>{t('app.name')}</Text>
          <Text style={styles.appVersion}>v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2026 Codeva</Text>
        </View>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Premium Kartı
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  premiumCardActive: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
  },
  premiumCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  premiumIconActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  premiumStatus: {
    fontSize: 14,
    color: colors.textMuted,
  },
  premiumStatusActive: {
    color: colors.warning,
    fontWeight: '600',
  },
  // Bölümler
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Dil Listesi
  languageList: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  languageItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  languageItemLast: {
    borderBottomWidth: 0,
  },
  languageFlag: {
    fontSize: 26,
    marginRight: 14,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  languageNameActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Menü Listesi
  menuList: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  // Uygulama Bilgisi
  appInfoSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  appLogoWrapper: {
    marginBottom: 12,
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accentPrimary,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default SettingsScreen;
