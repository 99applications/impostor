// Sayıyı artır/azalt (min-max arasında)
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

// Diziyi karıştır (Fisher-Yates)
export const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Vibration helper
import { Vibration, Platform } from 'react-native';

export const vibrate = (duration = 50) => {
  if (Platform.OS === 'ios') {
    // iOS için hafif titreşim
    Vibration.vibrate();
  } else {
    Vibration.vibrate(duration);
  }
};

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
