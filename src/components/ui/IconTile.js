import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../../theme/colors';

// Köşeleri yuvarlatılmış ikon kutusu.
// soft=true → renkli ikon, hafif renkli zemin; aksi halde gradient zemin.
const IconTile = ({
  name,
  size = 48,
  iconSize,
  gradient = gradients.primary,
  soft = false,
  round = false,
  style,
}) => {
  const shape = {
    width: size,
    height: size,
    borderRadius: round ? size / 2 : size * 0.32,
  };
  const glyphSize = iconSize || Math.round(size * 0.48);

  if (soft) {
    const tint = gradient[gradient.length - 1];
    return (
      <View
        style={[
          styles.center,
          shape,
          { backgroundColor: withAlpha(tint, 0.16) },
          style,
        ]}
      >
        <Icon name={name} size={glyphSize} color={gradient[0]} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.center, shape, styles.border, style]}
    >
      <Icon name={name} size={glyphSize} color={colors.textPrimary} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
});

export default IconTile;
