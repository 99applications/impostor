import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import DeviceInfo from 'react-native-device-info';
import { colors, gradients, withAlpha } from '../theme/colors';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';
import { usePremium } from '../context/PremiumContext';
import {
  AppLogo,
  GlassCard,
  IconTile,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';

const APP_VERSION = DeviceInfo.getVersion();

const APP_STORE_URL = 'https://apps.apple.com/app/idXXXXXXXXX'; // App Store ID'ni ekle
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.impostor';
const SUPPORT_EMAIL = 'imposter@codeva.com.tr';
const PRIVACY_URL = 'https://codeva.com.tr/imposter/privacy';
const TERMS_URL = 'https://codeva.com.tr/imposter/terms';

const MUTED_GRADIENT = ['#a9a6c6', '#6f6b92'];

const MenuRow = ({ icon, gradient, title, onPress, trailing, isLast }) => (
  <PressableScale
    scaleTo={0.98}
    onPress={onPress}
    style={[styles.menuRow, !isLast && styles.menuRowBorder]}
  >
    <IconTile name={icon} size={38} gradient={gradient} soft />
    <Text style={styles.menuText}>{title}</Text>
    <Icon
      name={trailing || 'chevron-forward'}
      size={18}
      color={colors.textMuted}
    />
  </PressableScale>
);

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
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('settings.title')}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Kartı */}
          <PressableScale
            scaleTo={0.98}
            onPress={() => navigation.navigate('Premium')}
          >
            <LinearGradient
              colors={[
                withAlpha(colors.warning, 0.3),
                withAlpha(colors.accentPink, 0.14),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumCard}
            >
              <IconTile name="diamond" size={52} gradient={gradients.warning} />
              <View style={styles.premiumInfo}>
                <Text style={styles.premiumTitle}>
                  {isPremium
                    ? t('settings.premiumActive')
                    : t('settings.premium')}
                </Text>
                <Text style={styles.premiumStatus}>
                  {getPremiumStatusText()}
                </Text>
              </View>
              <View style={styles.premiumArrow}>
                <Icon
                  name="chevron-forward"
                  size={18}
                  color={colors.textPrimary}
                />
              </View>
            </LinearGradient>
          </PressableScale>

          {/* Dil Seçimi */}
          <SectionLabel
            icon="language"
            title={t('settings.language')}
            style={styles.sectionSpacing}
          />
          <GlassCard style={styles.list}>
            {SUPPORTED_LANGUAGES.map((lang, index) => {
              const isSelected = i18n.language === lang.code;
              const isLast = index === SUPPORTED_LANGUAGES.length - 1;
              return (
                <PressableScale
                  key={lang.code}
                  scaleTo={0.98}
                  style={[styles.menuRow, !isLast && styles.menuRowBorder]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <View style={styles.flagBox}>
                    <Text style={styles.flag}>{lang.flag}</Text>
                  </View>
                  <Text
                    style={[
                      styles.menuText,
                      !isSelected && styles.menuTextMuted,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.primary}
                      style={styles.checkIcon}
                    >
                      <Icon
                        name="checkmark"
                        size={15}
                        color={colors.textPrimary}
                      />
                    </LinearGradient>
                  ) : (
                    <View style={styles.checkEmpty} />
                  )}
                </PressableScale>
              );
            })}
          </GlassCard>

          {/* Destek */}
          <SectionLabel
            icon="heart"
            iconColor={colors.accentPink}
            title={t('settings.support')}
            style={styles.sectionSpacing}
          />
          <GlassCard style={styles.list}>
            <MenuRow
              icon="star"
              gradient={gradients.warning}
              title={t('settings.rateApp')}
              onPress={handleRateApp}
            />
            <MenuRow
              icon="share-social"
              gradient={gradients.success}
              title={t('settings.shareApp')}
              onPress={handleShareApp}
            />
            <MenuRow
              icon="mail"
              gradient={['#c4b5fd', '#7c3aed']}
              title={t('settings.feedback')}
              onPress={handleFeedback}
              isLast
            />
          </GlassCard>

          {/* Yasal */}
          <SectionLabel
            icon="document-text"
            title={t('settings.legal')}
            style={styles.sectionSpacing}
          />
          <GlassCard style={styles.list}>
            <MenuRow
              icon="shield-checkmark"
              gradient={MUTED_GRADIENT}
              title={t('settings.privacy')}
              onPress={handlePrivacy}
              trailing="open-outline"
            />
            <MenuRow
              icon="document"
              gradient={MUTED_GRADIENT}
              title={t('settings.terms')}
              onPress={handleTerms}
              trailing="open-outline"
              isLast
            />
          </GlassCard>

          {/* Uygulama Bilgisi */}
          <View style={styles.appInfo}>
            <AppLogo size={60} animated={false} />
            <Text style={styles.appName}>{t('app.name')}</Text>
            <Text style={styles.appVersion}>v{APP_VERSION}</Text>
            <Text style={styles.appCopyright}>© 2026 Codeva</Text>
          </View>
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
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, 0.45),
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  premiumStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fcd34d',
  },
  premiumArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionSpacing: {
    marginTop: 26,
  },
  list: {
    paddingHorizontal: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuTextMuted: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  flagBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flag: {
    fontSize: 22,
  },
  checkIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkEmpty: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
  },
  appInfo: {
    alignItems: 'center',
    paddingTop: 36,
  },
  appName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 2,
  },
  appVersion: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  appCopyright: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default SettingsScreen;
