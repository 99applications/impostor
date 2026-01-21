import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';

const LANGUAGE_KEY = '@app_language';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

// Cihazın dilini al
const getDeviceLanguage = () => {
  let deviceLanguage = 'en';

  if (Platform.OS === 'ios') {
    // iOS için
    deviceLanguage =
      NativeModules.SettingsManager?.settings?.AppleLocale || // iOS 12 ve altı
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || // iOS 13+
      'en';
  } else {
    // Android için
    deviceLanguage = NativeModules.I18nManager?.localeIdentifier || 'en';
  }

  // Dil kodunu al (örn: "tr_TR" -> "tr", "en_US" -> "en")
  const languageCode = deviceLanguage.split(/[-_]/)[0];

  // Desteklenen dil mi kontrol et
  const isSupported = SUPPORTED_LANGUAGES.some(
    lang => lang.code === languageCode,
  );

  return isSupported ? languageCode : 'en';
};

// Dil algılayıcı
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    try {
      // Önce kullanıcının kaydettiği dili kontrol et
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.log('Error reading language', error);
    }

    // Kayıtlı dil yoksa cihazın dilini kullan
    const deviceLang = getDeviceLanguage();
    callback(deviceLang);
  },
  init: () => {},
  cacheUserLanguage: async language => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Dil değiştirme fonksiyonu (export et)
export const changeLanguage = async languageCode => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.log('Error changing language', error);
  }
};

// Mevcut dili al
export const getCurrentLanguage = () => i18n.language;

export default i18n;
