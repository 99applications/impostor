import React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
  TransitionPresets,
} from '@react-navigation/stack';
import { colors } from '../theme/colors';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import OnboardingScreen from '../screens/Onboardingscreen';
import HomeScreen from '../screens/HomeScreen';
import HowToPlayScreen from '../screens/HowToPlayScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import PlayerTurnScreen from '../screens/PlayerTurnScreen';
import GameEndScreen from '../screens/GameEndScreen';
import VotingScreen from '../screens/VotingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlayerSetupScreen from '../screens/PlayerSetupScreen';
import CategorySelectScreen from '../screens/CategorySelectScreen';
import PremiumScreen from '../screens/PremiumScreen';
import PaywallScreen from '../screens/PaywallScreen';
import CustomCategoryScreen from '../screens/CustomCategoryScreen';
import MyCategoriesScreen from '../screens/MyCategoriesScreen';

const Stack = createStackNavigator();

// Oyun akışında ve açılışta kayma yerine yumuşak geçiş.
const fadeOptions = {
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.bgPrimary },
        gestureEnabled: false,
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="LanguageSelect"
        component={LanguageSelectScreen}
        options={fadeOptions}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={fadeOptions}
      />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Home" component={HomeScreen} options={fadeOptions} />
      <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
      <Stack.Screen name="GameSetup" component={GameSetupScreen} />
      <Stack.Screen
        name="PlayerTurn"
        component={PlayerTurnScreen}
        options={fadeOptions}
      />
      <Stack.Screen
        name="Voting"
        component={VotingScreen}
        options={fadeOptions}
      />
      <Stack.Screen
        name="GameEnd"
        component={GameEndScreen}
        options={fadeOptions}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PlayerSetup" component={PlayerSetupScreen} />
      <Stack.Screen name="CategorySelect" component={CategorySelectScreen} />
      <Stack.Screen name="Premium" component={PremiumScreen} />
      <Stack.Screen name="CustomCategory" component={CustomCategoryScreen} />
      <Stack.Screen name="MyCategories" component={MyCategoriesScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
