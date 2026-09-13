import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, gradients, withAlpha } from '../../theme/colors';

const GLOWS = {
  violet: [colors.accentPrimary, colors.accentPink],
  danger: [colors.danger, colors.accentPrimary],
  success: [colors.success, colors.accentPrimary],
  warning: [colors.warning, colors.accentPink],
};

// Tüm ekranların ortak arka planı: koyu gradient + yumuşak renk parlamaları.
// Parlamalar kenarı sert daireler yerine üst üste binen gradientlerle çizilir.
const ScreenBackground = ({ children, glow = 'violet', style }) => {
  const [top, bottom] = GLOWS[glow] || GLOWS.violet;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradients.background}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[withAlpha(top, 0.3), withAlpha(top, 0)]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.25, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[withAlpha(bottom, 0.16), withAlpha(bottom, 0)]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.6, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
});

export default ScreenBackground;
