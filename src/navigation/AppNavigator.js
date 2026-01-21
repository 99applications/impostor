import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import PlayerTurnScreen from '../screens/PlayerTurnScreen';
import GameEndScreen from '../screens/GameEndScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlayerSetupScreen from '../screens/PlayerSetupScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0d0d1a' },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
      <Stack.Screen name="GameSetup" component={GameSetupScreen} />
      <Stack.Screen name="PlayerTurn" component={PlayerTurnScreen} />
      <Stack.Screen name="GameEnd" component={GameEndScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
