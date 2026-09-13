import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IconButton from './IconButton';
import { colors } from '../../theme/colors';

// Geri butonu, ortalanmış başlık ve isteğe bağlı sağ aksiyon.
const ScreenHeader = ({ title, subtitle, onBack, right, style }) => (
  <View style={[styles.header, style]}>
    <View pointerEvents="none" style={styles.titleWrapper}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
    <View style={styles.side}>
      {onBack ? <IconButton name="chevron-back" onPress={onBack} /> : null}
    </View>
    <View style={[styles.side, styles.sideRight]}>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 68,
  },
  titleWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 84,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  side: {
    minWidth: 44,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
});

export default ScreenHeader;
