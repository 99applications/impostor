import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import es from './locales/es.json';

const LANGUAGE_KEY = '@app_language';
export const LANGUAGE_SELECTED_KEY = '@language_selected';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const getDeviceLocaleString = () => {
  const candidates = [];

  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (intlLocale) {
      candidates.push(intlLocale);
    }
  } catch (error) {
    // Intl locale is unavailable
  }

  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    candidates.push(settings?.AppleLocale, settings?.AppleLanguages?.[0]);
  } else {
    candidates.push(NativeModules.I18nManager?.localeIdentifier);
  }

  return (
    candidates.find(value => typeof value === 'string' && value.length > 0) || ''
  );
};

// Returns the device language if it is supported; otherwise null
export const getSupportedDeviceLanguage = () => {
  const languageCode = getDeviceLocaleString()
    .split(/[-_]/)[0]
    ?.toLowerCase();
  const isSupported = SUPPORTED_LANGUAGES.some(
    lang => lang.code === languageCode,
  );

  return isSupported ? languageCode : null;
};

export const getDeviceLanguage = () => getSupportedDeviceLanguage() || 'en';

// Start the app in the device language immediately
const languageDetector = {
  type: 'languageDetector',
  async: false,
  detect: () => getDeviceLanguage(),
  init: () => {},
  cacheUserLanguage: () => {},
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// After the user has confirmed a language, apply that saved choice
(async () => {
  try {
    const languageSelected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
    if (!languageSelected) {
      return;
    }
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.log('Error reading language', error);
  }
})();

// Persist and apply a language change
export const changeLanguage = async languageCode => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.log('Error changing language', error);
  }
};

// Current language
export const getCurrentLanguage = () => i18n.language;

export default i18n;
