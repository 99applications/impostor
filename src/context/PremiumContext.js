import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PremiumContext = createContext();

const PREMIUM_KEY = '@is_premium';
const PREMIUM_TYPE_KEY = '@premium_type';
const PREMIUM_EXPIRY_KEY = '@premium_expiry';

export const PremiumProvider = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumType, setPremiumType] = useState(null); // 'monthly' | 'lifetime'
  const [expiryDate, setExpiryDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açıldığında premium durumunu kontrol et
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  // Premium durumunu kontrol et
  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);

      const [savedPremium, savedType, savedExpiry] = await Promise.all([
        AsyncStorage.getItem(PREMIUM_KEY),
        AsyncStorage.getItem(PREMIUM_TYPE_KEY),
        AsyncStorage.getItem(PREMIUM_EXPIRY_KEY),
      ]);

      if (savedPremium === 'true') {
        // Ömür boyu ise direkt premium
        if (savedType === 'lifetime') {
          setIsPremium(true);
          setPremiumType('lifetime');
        }
        // Aylık ise süre kontrolü yap
        else if (savedType === 'monthly' && savedExpiry) {
          const expiry = new Date(savedExpiry);
          if (expiry > new Date()) {
            setIsPremium(true);
            setPremiumType('monthly');
            setExpiryDate(expiry);
          } else {
            // Süresi dolmuş, premium'u kaldır
            await clearPremium();
          }
        }
      }
    } catch (error) {
      console.log('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Premium'u aktifleştir
  const activatePremium = async type => {
    try {
      let expiry = null;

      if (type === 'monthly') {
        // 30 gün ekle
        expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
      }

      await AsyncStorage.setItem(PREMIUM_KEY, 'true');
      await AsyncStorage.setItem(PREMIUM_TYPE_KEY, type);

      if (expiry) {
        await AsyncStorage.setItem(PREMIUM_EXPIRY_KEY, expiry.toISOString());
        setExpiryDate(expiry);
      }

      setIsPremium(true);
      setPremiumType(type);

      return true;
    } catch (error) {
      console.log('Error activating premium:', error);
      return false;
    }
  };

  // Premium'u kaldır
  const clearPremium = async () => {
    try {
      await AsyncStorage.multiRemove([
        PREMIUM_KEY,
        PREMIUM_TYPE_KEY,
        PREMIUM_EXPIRY_KEY,
      ]);
      setIsPremium(false);
      setPremiumType(null);
      setExpiryDate(null);
    } catch (error) {
      console.log('Error clearing premium:', error);
    }
  };

  // Kalan gün sayısı
  const getDaysRemaining = () => {
    if (!expiryDate || premiumType === 'lifetime') return null;

    const now = new Date();
    const diff = expiryDate - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const value = {
    isPremium,
    premiumType,
    expiryDate,
    isLoading,
    activatePremium,
    clearPremium,
    checkPremiumStatus,
    getDaysRemaining,
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
