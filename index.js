/**
 * @format
 */

import '@react-native-firebase/app';
import crashlytics from '@react-native-firebase/crashlytics';
import { AppRegistry } from 'react-native';

crashlytics().log('App initialized');
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
