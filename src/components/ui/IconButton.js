import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableScale from './PressableScale';
import { colors, gradients, withAlpha } from '../../theme/colors';

// Yuvarlak ikon butonu. variant: 'glass' | 'accent' | 'danger'
const IconButton = ({
  name,
  onPress,
  size = 44,
  iconSize = 22,
  color,
  variant = 'glass',
  disabled,
  style,
}) => {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (variant === 'accent') {
    return (
      <PressableScale
        onPress={onPress}
        disabled={disabled}
        style={[shape, style]}
        hitSlop={8}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.center, shape]}
        >
          <Icon
            name={name}
            size={iconSize}
            color={color || colors.textPrimary}
          />
        </LinearGradient>
      </PressableScale>
    );
  }

  const isDanger = variant === 'danger';

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={[
        styles.center,
        shape,
        isDanger ? styles.danger : styles.glass,
        style,
      ]}
    >
      <Icon
        name={name}
        size={iconSize}
        color={color || (isDanger ? colors.danger : colors.textPrimary)}
      />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  danger: {
    backgroundColor: withAlpha(colors.danger, 0.14),
    borderWidth: 1,
    borderColor: withAlpha(colors.danger, 0.25),
  },
});

export default IconButton;
