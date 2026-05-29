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

export const vibrate = (pattern = 50) => {
  try {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(pattern);
    }
  } catch {
    // Ignore if vibration is unavailable or permission denied
  }
};

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
