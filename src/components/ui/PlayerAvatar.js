import React from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { avatarGradients, colors } from '../../theme/colors';

export const getAvatarGradient = index =>
  avatarGradients[Math.abs(index) % avatarGradients.length];

// Varsayılan "Oyuncu 3" isimlerinde hepsi aynı harfi göstermesin diye numara,
// özel isimlerde baş harf gösterilir.
const getAvatarLabel = (name, index, defaultPrefix) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return String(index + 1);

  const defaultMatch = trimmed.match(/^(.*)\s(\d+)$/);
  if (defaultMatch && defaultMatch[1] === defaultPrefix) {
    return defaultMatch[2];
  }
  return trimmed.charAt(0).toLocaleUpperCase();
};

const PlayerAvatar = ({ name, index = 0, size = 44, icon, gradient, style }) => {
  const { t } = useTranslation();
  const shape = { width: size, height: size, borderRadius: size / 2 };

  return (
    <LinearGradient
      colors={gradient || getAvatarGradient(index)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, shape, style]}
    >
      {icon ? (
        <Icon name={icon} size={size * 0.5} color={colors.textPrimary} />
      ) : (
        <Text style={[styles.label, { fontSize: size * 0.42 }]}>
          {getAvatarLabel(name, index, t('game.player'))}
        </Text>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  label: {
    fontWeight: '900',
    color: colors.textPrimary,
  },
});

export default PlayerAvatar;
