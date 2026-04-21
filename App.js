import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PremiumProvider } from './src/context/PremiumContext';
// i18n'i import et (side effect olarak çalışır)
import './src/i18n';
import { preloadInterstitialAd } from './src/utils/adManager';

// Context
import { GameProvider } from './src/context/GameContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { colors } from './src/theme/colors';

const App = () => {
  useEffect(() => {
    // Uygulama açılırken ilk reklamı önceden yükle
    preloadInterstitialAd();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PremiumProvider>
          <GameProvider>
            <NavigationContainer>
              <StatusBar
                barStyle="light-content"
                backgroundColor={colors.bgPrimary}
              />
              <AppNavigator />
            </NavigationContainer>
          </GameProvider>
        </PremiumProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
