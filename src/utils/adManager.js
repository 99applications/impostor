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

const AD_EVERY_N_GAMES = 3;
const AD_MIN_COOLDOWN_MS = 60 * 1000; // 1 minute between interstitials

let ad = null;
let isLoaded = false;
let isLoading = false;
let isConfigured = false;
let gamesSinceLastAd = 0;
let lastAdShownAt = 0;

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

const canShowAdNow = () => {
  gamesSinceLastAd += 1;
  if (gamesSinceLastAd < AD_EVERY_N_GAMES) {
    return false;
  }
  if (Date.now() - lastAdShownAt < AD_MIN_COOLDOWN_MS) {
    return false;
  }
  return true;
};

// Oyun bitince çağırın - her N oyunda bir + cooldown; hazır değilse onClosed hemen
export const showInterstitialAd = onClosed => {
  if (!canShowAdNow()) {
    if (onClosed) onClosed();
    return;
  }

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
  gamesSinceLastAd = 0;
  lastAdShownAt = Date.now();
  ad.show();
};
