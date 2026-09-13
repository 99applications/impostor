import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme/colors';

const SectionLabel = ({ icon, title, right, iconColor, style }) => (
  <View style={[styles.row, style]}>
    {!!icon && (
      <Icon name={icon} size={16} color={iconColor || colors.accentSecondary} />
    )}
    <Text style={styles.title} numberOfLines={1}>
      {title}
    </Text>
    {right}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
});

export default SectionLabel;
