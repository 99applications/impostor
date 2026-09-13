import React from 'react';
import { View, StyleSheet } from 'react-native';
import PressableScale from './PressableScale';
import { colors, radius, withAlpha } from '../../theme/colors';

// Yarı saydam kart. active=true iken vurgu rengiyle çerçevelenir.
const GlassCard = ({
  children,
  style,
  active = false,
  activeColor = colors.accentPrimary,
  onPress,
  disabled,
}) => {
  const cardStyle = [
    styles.card,
    active && {
      borderColor: activeColor,
      backgroundColor: withAlpha(activeColor, 0.12),
    },
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        scaleTo={0.98}
        onPress={onPress}
        disabled={disabled}
        style={cardStyle}
      >
        {children}
      </PressableScale>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(30, 26, 58, 0.72)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});

export default GlassCard;
