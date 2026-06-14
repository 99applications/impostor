This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

---

# 🍏 iOS Kurulumu — Tamamlanması Gereken Adımlar

Bu proje iOS için Crashlytics, RevenueCat ve AdMob ile çalışacak şekilde hazırlandı.
Aşağıdaki **placeholder değerleri kendi gerçek değerlerinizle değiştirmeniz** gerekiyor.
Tüm kod/yapılandırma değişiklikleri zaten yapıldı; sadece bu listeyi tamamlayın.

> Değiştirilmesi gereken her placeholder'da `X`, `Y`, `Z` gibi büyük harf diziler bulunur.

## 1) Bundle Identifier
- ✅ Şu an **`com.codeva.imposter`** olarak ayarlı (Firebase'deki iOS app bundle ID'si ile eşleşiyor):
  [`ios/impostor.xcodeproj/project.pbxproj`](ios/impostor.xcodeproj/project.pbxproj) içindeki iki `PRODUCT_BUNDLE_IDENTIFIER` satırı.
- Değiştirmek isterseniz Xcode > hedef **impostor** > **Signing & Capabilities** > Bundle Identifier'dan yapın.
- ⚠️ Bu bundle ID; Firebase, **RevenueCat iOS app** ve **AdMob iOS app** kayıtlarıyla **birebir aynı** olmalı.
  RevenueCat ve AdMob console'larında iOS uygulamasını `com.codeva.imposter` ile oluşturduğunuzdan emin olun.

## 2) Firebase / Crashlytics → `GoogleService-Info.plist`
- ✅ **Eklendi ve projeye kayıtlı:** `ios/impostor/GoogleService-Info.plist` (Copy Bundle Resources'a dahil).
- Firebase projesini değiştirirseniz: [Firebase Console](https://console.firebase.google.com)'dan yeni
  `GoogleService-Info.plist`'i indirip aynı konuma koyun (içindeki `BUNDLE_ID`, Xcode bundle ID'si ile eşleşmeli).
- `AppDelegate.swift` içinde `FirebaseApp.configure()` zaten eklendi — başka kod gerekmez.
- **dSYM yükleme (Crashlytics sembolizasyonu) ELLE EKLENMEZ:** `@react-native-firebase/crashlytics`
  pod'u, `[CP-User] [RNFB] Crashlytics Configuration` adlı Run Script build phase'ini `pod install`
  sırasında **otomatik ekler** (`${PODS_ROOT}/FirebaseCrashlytics/run`). Manuel ekleme yapmayın,
  yoksa script iki kez çalışır.
- ⚠️ **Bu dosya olmadan iOS build başarısız olur.** Build, otomatik Crashlytics script'inde
  `error: Could not get GOOGLE_APP_ID ...` hatasıyla durur. Dosyayı ekleyince sorun biter.

## 3) AdMob
- ✅ **iOS AdMob App ID** girildi → [`ios/impostor/Info.plist`](ios/impostor/Info.plist) `GADApplicationIdentifier`
  = `ca-app-pub-6529717155550493~6236034617`.
- ✅ **iOS Interstitial Ad Unit ID** girildi → [`src/utils/adManager.js`](src/utils/adManager.js)
  `IOS_INTERSTITIAL_AD_UNIT_ID` = `ca-app-pub-6529717155550493/6044462925`.
- `__DEV__`'de otomatik test reklamı, release'de bu gerçek ID kullanılır.
- `Info.plist`'e ATT izin metni (`NSUserTrackingUsageDescription`) ve `SKAdNetworkItems` listesi zaten eklendi.
  Ek ağlar kullanıyorsanız [Google'ın güncel SKAdNetwork listesini](https://developers.google.com/admob/ios/ios14) ekleyebilirsiniz.

## 4) RevenueCat
- **iOS API Key (`appl_` ile başlar)** → [`src/context/PremiumContext.js`](src/context/PremiumContext.js) içindeki
  `REVENUECAT_API_KEY_IOS`: şu an `appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXX`.
  RevenueCat Dashboard > Project Settings > API Keys > **Apple App Store** key'i ile değiştirin.
  (Önceki kodda iOS için yanlışlıkla Android `goog_` key'i kullanılıyordu, düzeltildi.)
- App Store Connect'te abonelik ürünlerini (`premium_monthly`, `premium_yearly`) oluşturup
  RevenueCat'te aynı offering/entitlement (`premium`) altında eşleştirin.

## 5) Pod kurulumu (her config değişikliğinden sonra)
```bash
cd ios
pod install
cd ..
```
> Firebase için Podfile artık `use_frameworks! :linkage => :static` ve `$RNFirebaseAsStaticFramework = true` kullanıyor.

## 6) Çalıştırma / Derleme
```bash
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```
- Apple Developer hesabınızda imzalama (Signing) ayarlarını Xcode'dan yapın.
- AdMob/ATT'nin gerçek cihazda test edilmesi önerilir (Simülatörde IDFA sınırlıdır).

## Özet — Kalan placeholder'lar
| Yer | Değer | Durum |
|-----|-------|-------|
| `project.pbxproj` bundle ID | `com.codeva.imposter` | ✅ ayarlandı |
| `ios/impostor/GoogleService-Info.plist` | Firebase dosyası | ✅ eklendi & kayıtlı |
| `Info.plist` → `GADApplicationIdentifier` | `ca-app-pub-6529717155550493~6236034617` | ✅ girildi |
| `adManager.js` → `IOS_INTERSTITIAL_AD_UNIT_ID` | `ca-app-pub-6529717155550493/6044462925` | ✅ girildi |
| `PremiumContext.js` → `REVENUECAT_API_KEY_IOS` | `appl_XXXX...` | ⬜ RevenueCat iOS (Apple) key ile değiştir |
