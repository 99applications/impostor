import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// i18n'i import et (side effect olarak çalışır)
import './src/i18n';

// Context
import { GameProvider } from './src/context/GameContext';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Theme
import { colors } from './src/theme/colors';

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameProvider>
          <NavigationContainer>
            <StatusBar
              barStyle="light-content"
              backgroundColor={colors.bgPrimary}
            />
            <AppNavigator />
          </NavigationContainer>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
