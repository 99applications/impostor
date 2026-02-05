import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const PremiumContext = createContext();

// RevenueCat API Keys - Kendi key'lerinizi buraya ekleyin
const REVENUECAT_API_KEY_IOS = 'test_BvhppRfpKJgDBaArpgSYNqRHPfP';
const REVENUECAT_API_KEY_ANDROID = 'test_BvhppRfpKJgDBaArpgSYNqRHPfP';

// Product IDs - RevenueCat Dashboard'da oluşturduğunuz ürün ID'leri
const PRODUCT_IDS = {
  monthly: 'premium_monthly',
  lifetime: 'premium_lifetime',
};

// Entitlement ID
const ENTITLEMENT_ID = 'premium';

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState(null); // 'monthly' | 'lifetime'
  const [expiryDate, setExpiryDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);

  // RevenueCat başlat
  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      setIsLoading(true);

      // Debug modda log seviyesini ayarla
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      // Platform'a göre API key seç
      const apiKey =
        Platform.OS === 'ios'
          ? REVENUECAT_API_KEY_IOS
          : REVENUECAT_API_KEY_ANDROID;

      // RevenueCat'i yapılandır
      await Purchases.configure({ apiKey });

      // Mevcut abonelik durumunu kontrol et
      await checkSubscriptionStatus();

      // Satın alınabilir paketleri al
      await fetchPackages();

      // Listener ekle - abonelik değişikliklerini dinle
      Purchases.addCustomerInfoUpdateListener(info => {
        handleCustomerInfoUpdate(info);
      });
    } catch (error) {
      console.log('RevenueCat initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abonelik durumunu kontrol et
  const checkSubscriptionStatus = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      handleCustomerInfoUpdate(info);
    } catch (error) {
      console.log('Error checking subscription:', error);
    }
  };

  // Customer info güncellendiğinde
  const handleCustomerInfoUpdate = info => {
    setCustomerInfo(info);

    // Premium entitlement'ı kontrol et
    const premiumEntitlement = info.entitlements.active[ENTITLEMENT_ID];

    if (premiumEntitlement) {
      setIsPremium(true);

      // Ürün tipini belirle
      const productId = premiumEntitlement.productIdentifier;

      if (productId === PRODUCT_IDS.lifetime) {
        setPremiumType('lifetime');
        setExpiryDate(null);
      } else {
        setPremiumType('monthly');
        // Bitiş tarihini ayarla
        if (premiumEntitlement.expirationDate) {
          setExpiryDate(new Date(premiumEntitlement.expirationDate));
        }
      }
    } else {
      setIsPremium(false);
      setPremiumType(null);
      setExpiryDate(null);
    }
  };

  // Satın alınabilir paketleri al
  const fetchPackages = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.log('Error fetching packages:', error);
    }
  };

  // Satın alma işlemi
  const purchasePackage = async packageToPurchase => {
    try {
      setIsLoading(true);

      const { customerInfo } = await Purchases.purchasePackage(
        packageToPurchase,
      );

      // Satın alma başarılı, customer info güncellendi
      handleCustomerInfoUpdate(customerInfo);

      return { success: true };
    } catch (error) {
      if (!error.userCancelled) {
        console.log('Purchase error:', error);

        // Hata mesajını döndür
        let errorMessage = 'Satın alma işlemi başarısız oldu.';

        if (
          error.code ===
          Purchases.PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED
        ) {
          errorMessage = 'Bu ürün zaten satın alınmış.';
        } else if (
          error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED
        ) {
          errorMessage = 'Satın alma izni yok.';
        } else if (
          error.code === Purchases.PURCHASES_ERROR_CODE.PAYMENT_PENDING
        ) {
          errorMessage = 'Ödeme beklemede.';
        }

        return { success: false, error: errorMessage };
      }

      // Kullanıcı iptal etti
      return { success: false, cancelled: true };
    } finally {
      setIsLoading(false);
    }
  };

  // Product ID ile satın alma (alternatif yöntem)
  const purchaseProduct = async productId => {
    try {
      setIsLoading(true);

      // Paketler içinden ürünü bul
      const packageToPurchase = packages.find(
        pkg => pkg.product.identifier === productId,
      );

      if (!packageToPurchase) {
        throw new Error('Ürün bulunamadı');
      }

      return await purchasePackage(packageToPurchase);
    } catch (error) {
      console.log('Purchase product error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Satın almaları geri yükle
  const restorePurchases = async () => {
    try {
      setIsLoading(true);

      const info = await Purchases.restorePurchases();
      handleCustomerInfoUpdate(info);

      // Premium aktif mi kontrol et
      const hasPremium = info.entitlements.active[ENTITLEMENT_ID];

      return {
        success: true,
        restored: !!hasPremium,
        message: hasPremium
          ? 'Satın almalarınız geri yüklendi!'
          : 'Geri yüklenecek satın alma bulunamadı.',
      };
    } catch (error) {
      console.log('Restore error:', error);
      return { success: false, error: 'Geri yükleme başarısız oldu.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Kalan gün sayısı
  const getDaysRemaining = () => {
    if (!expiryDate || premiumType === 'lifetime') return null;

    const now = new Date();
    const diff = expiryDate - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Fiyat bilgisi al
  const getProductPrice = type => {
    const productId = PRODUCT_IDS[type];
    const pkg = packages.find(p => p.product.identifier === productId);
    return pkg ? pkg.product.priceString : null;
  };

  // Tüm fiyatları al
  const getPrices = () => {
    return {
      monthly: getProductPrice('monthly'),
      lifetime: getProductPrice('lifetime'),
    };
  };

  const value = {
    // State
    isPremium,
    premiumType,
    expiryDate,
    isLoading,
    packages,
    customerInfo,

    // Actions
    purchasePackage,
    purchaseProduct,
    restorePurchases,
    checkSubscriptionStatus,

    // Helpers
    getDaysRemaining,
    getProductPrice,
    getPrices,
    PRODUCT_IDS,
  };

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
