import { Platform } from 'react-native';
import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

// DEV modunda test reklamı, production'da kendi Ad Unit ID'nizi kullanın.
// AdMob Dashboard'dan aldığınız Interstitial Ad Unit ID'leri platforma göre buraya yazın.
// NOT: iOS ve Android için AdMob'da AYRI ad unit ID oluşturulur.
const ANDROID_INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-6529717155550493/1586364279';
const IOS_INTERSTITIAL_AD_UNIT_ID = 'ca-app-pub-6529717155550493/6044462925';

const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
  ? IOS_INTERSTITIAL_AD_UNIT_ID
  : ANDROID_INTERSTITIAL_AD_UNIT_ID;

let ad = null;
let isLoaded = false;
let isLoading = false;
let isConfigured = false;

// 13+ hedef kitle: uygulama çocuklara yönelik DEĞİL.
// tagForChildDirectedTreatment / tagForUnderAgeOfConsent KULLANILMIYOR;
// bunlar açık olursa Google uygulamayı Families politikasına sokar ve
// interstitial reklamlar reddedilir. İçerik derecesini G ile sınırlı tutuyoruz.
const configureAds = async () => {
  if (isConfigured) return;
  isConfigured = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
    });
    await mobileAds().initialize();
  } catch (e) {
    console.log('Ad config error:', e);
  }
};

const createAndLoad = () => {
  if (isLoading) return;
  isLoading = true;
  isLoaded = false;

  ad = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
    isLoading = false;
  });

  ad.addAdEventListener(AdEventType.ERROR, () => {
    isLoaded = false;
    isLoading = false;
  });

  ad.load();
};

// Uygulama başlarken çağırın (App.js'de)
export const preloadInterstitialAd = async () => {
  await configureAds();
  createAndLoad();
};

// Oyun bitince çağırın - her oyun sonunda gösterir; hazır değilse onClosed hemen
export const showInterstitialAd = onClosed => {
  if (!ad || !isLoaded) {
    if (onClosed) onClosed();
    createAndLoad();
    return;
  }

  const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    unsubClosed();
    isLoaded = false;
    createAndLoad();
    if (onClosed) onClosed();
  });

  const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
    unsubError();
    isLoaded = false;
    createAndLoad();
    if (onClosed) onClosed();
  });

  isLoaded = false;
  ad.show();
};
