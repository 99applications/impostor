import mobileAds, {
  InterstitialAd,
  AdEventType,
  TestIds,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';

// DEV modunda test reklamı, production'da kendi Ad Unit ID'nizi kullanın
// AdMob Dashboard'dan aldığınız Interstitial Ad Unit ID'yi buraya yazın
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-6529717155550493/1586364279';

let ad = null;
let isLoaded = false;
let isLoading = false;
let isConfigured = false;

// Aile Politikasına uygun reklam yapılandırması (COPPA/Family)
const configureAds = async () => {
  if (isConfigured) return;
  isConfigured = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G,
      tagForChildDirectedTreatment: true,
      tagForUnderAgeOfConsent: true,
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

// Oyun bitince çağırın - reklam hazırsa gösterir, değilse onClosed'ı hemen çağırır
export const showInterstitialAd = onClosed => {
  if (!ad || !isLoaded) {
    // Reklam hazır değil, hemen devam et
    if (onClosed) onClosed();
    // Bir sonraki oyun için yükle
    createAndLoad();
    return;
  }

  const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    unsubClosed();
    isLoaded = false;
    // Bir sonraki oyun için önceden yükle
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
