import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const CHARADES_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.blurt.party';

const CharadesBanner = ({ variant = 'home', style }) => {
  const { t } = useTranslation();

  if (Platform.OS !== 'android') {
    return null;
  }

  const isHome = variant === 'home';

  const handlePress = () => {
    Linking.openURL(CHARADES_PLAY_STORE_URL).catch(() => {
      Alert.alert(t('settings.error'), t('settings.cantOpenStore'));
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, isHome ? styles.containerHome : styles.containerSettings, style]}
      activeOpacity={0.85}
      onPress={handlePress}
    >
      {!isHome && <View style={styles.decorCircle} />}

      <View style={styles.mainRow}>
        <Image
          source={require('../assets/png/charadesLogo.png')}
          style={[styles.logo, isHome && styles.logoHome]}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, isHome && styles.titleHome]}
              numberOfLines={1}
            >
              {isHome
                ? t('charadesBanner.homeTitle')
                : t('charadesBanner.settingsTitle')}
            </Text>
            {isHome && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>
                  {t('charadesBanner.newBadge')}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.subtitle, isHome && styles.subtitleHome]}
            numberOfLines={2}
          >
            {t('charadesBanner.homeSubtitle')}
          </Text>
        </View>

        <View style={[styles.playButton, isHome && styles.playButtonHome]}>
          <Text
            style={[styles.playButtonText, isHome && styles.playButtonTextHome]}
          >
            {t('charadesBanner.play')}
          </Text>
        </View>
      </View>

      {isHome && (
        <Text style={[styles.footer, styles.footerHome]}>
          {t('charadesBanner.footer')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    padding: 15,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  containerHome: {
    padding: 12,
    borderRadius: 16,
  },
  containerSettings: {
    marginBottom: 24,
  },
  decorCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -30,
    right: -20,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginRight: 12,
  },
  logoHome: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  titleHome: {
    fontSize: 14,
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  subtitleHome: {
    fontSize: 12,
    lineHeight: 16,
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  playButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  playButtonHome: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  playButtonTextHome: {
    fontSize: 13,
  },
  footer: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
  },
  footerHome: {
    marginTop: 8,
    fontSize: 9,
  },
});

export default CharadesBanner;
