import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Basıldığında hafifçe küçülen dokunmatik alan.
const PressableScale = ({
  children,
  style,
  scaleTo = 0.96,
  disabled,
  onPress,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = toValue => {
    Animated.spring(scale, {
      toValue,
      speed: 40,
      bounciness: toValue === 1 ? 8 : 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animateTo(scaleTo)}
      onPressOut={() => animateTo(1)}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

export default PressableScale;
