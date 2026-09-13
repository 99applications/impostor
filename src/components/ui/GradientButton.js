import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import PressableScale from './PressableScale';
import { colors, gradients, radius } from '../../theme/colors';

const VARIANTS = {
  primary: { gradient: gradients.primary, glow: colors.accentPrimary },
  brand: { gradient: gradients.brand, glow: colors.accentPink },
  danger: { gradient: gradients.danger, glow: colors.danger },
  success: { gradient: gradients.success, glow: colors.success },
  warning: { gradient: gradients.warning, glow: colors.warning },
  secondary: { gradient: null, glow: null },
};

const SIZES = {
  lg: { height: 60, fontSize: 18, iconSize: 22 },
  md: { height: 52, fontSize: 16, iconSize: 20 },
  sm: { height: 40, fontSize: 14, iconSize: 16 },
};

const GradientButton = ({
  title,
  icon,
  iconRight,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  style,
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.lg;
  const isInactive = disabled || loading;
  const textColor =
    variant === 'secondary' ? colors.textSecondary : colors.textPrimary;

  const content = loading ? (
    <ActivityIndicator color={colors.textPrimary} />
  ) : (
    <>
      {!!icon && <Icon name={icon} size={s.iconSize} color={textColor} />}
      <Text
        style={[styles.text, { fontSize: s.fontSize, color: textColor }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {!!iconRight && (
        <Icon name={iconRight} size={s.iconSize} color={textColor} />
      )}
    </>
  );

  const innerStyle = [styles.inner, { height: s.height }];

  return (
    <PressableScale
      onPress={onPress}
      disabled={isInactive}
      style={[
        styles.base,
        v.glow && !disabled && styles.glow,
        v.glow && !disabled && {
          shadowColor: v.glow,
          backgroundColor: v.gradient[1],
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {v.gradient && !disabled ? (
        <LinearGradient
          colors={v.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[innerStyle, styles.gradientBorder]}
        >
          {content}
        </LinearGradient>
      ) : (
        <View style={[innerStyle, styles.flat]}>{content}</View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
  },
  glow: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
  },
  gradientBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  flat: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default GradientButton;
