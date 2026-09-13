import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// Açılışta aşağıdan yukarı süzülerek beliren kapsayıcı; delay ile sıralanabilir.
const FadeInView = ({ children, delay = 0, offset = 16, style }) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default FadeInView;
