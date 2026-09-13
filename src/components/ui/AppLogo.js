import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients } from '../../theme/colors';

// Uygulama logosu: gradient kutu + dışa doğru yayılan nabız halkası.
const AppLogo = ({ size = 112, animated = true, icon = 'finger-print' }) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return undefined;
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, pulse]);

  const corner = size * 0.32;
  const ringStyle = {
    width: size,
    height: size,
    borderRadius: corner,
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
    transform: [
      { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
    ],
  };

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {animated && <Animated.View style={[styles.ring, ringStyle]} />}
      <View
        style={[
          styles.shadow,
          { width: size, height: size, borderRadius: corner },
        ]}
      >
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.logo, { borderRadius: corner }]}
        >
          <Icon name={icon} size={size * 0.54} color={colors.textPrimary} />
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.accentSecondary,
  },
  shadow: {
    backgroundColor: colors.accentPrimary,
    shadowColor: colors.accentPink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 16,
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default AppLogo;
