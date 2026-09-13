import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;

// Her oyuncuya sırasına göre ayırt edici bir renk.
const AVATAR_COLORS = [
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
];

const PlayerSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, setPlayers, setPlayerCount } = useGame();

  // Local state - oyuncu isimleri
  const [players, setLocalPlayers] = useState([]);
  const [focusedId, setFocusedId] = useState(null);

  // Component mount olduğunda mevcut oyuncuları yükle
  useEffect(() => {
    if (state.players && state.players.length > 0) {
      setLocalPlayers(state.players);
    } else {
      // Varsayılan oyuncuları oluştur
      const defaultPlayers = Array.from(
        { length: state.playerCount },
        (_, i) => ({
          id: i + 1,
          name: `${t('game.player')} ${i + 1}`,
          isImposter: false,
        }),
      );
      setLocalPlayers(defaultPlayers);
    }
  }, []);

  const isAtMin = players.length <= MIN_PLAYERS;
  const isAtMax = players.length >= MAX_PLAYERS;

  // Oyuncu ekle
  const handleAddPlayer = () => {
    if (isAtMax) {
      Alert.alert(
        t('playerSetup.maxPlayersTitle'),
        t('playerSetup.maxPlayersMessage'),
      );
      return;
    }

    const newPlayer = {
      id: players.length + 1,
      name: `${t('game.player')} ${players.length + 1}`,
      isImposter: false,
    };
    setLocalPlayers([...players, newPlayer]);
  };

  // Oyuncu sil
  const handleRemovePlayer = playerId => {
    if (isAtMin) {
      Alert.alert(
        t('playerSetup.minPlayersTitle'),
        t('playerSetup.minPlayersMessage'),
      );
      return;
    }

    const updatedPlayers = players
      .filter(p => p.id !== playerId)
      .map((p, index) => ({ ...p, id: index + 1 })); // ID'leri yeniden sırala

    setLocalPlayers(updatedPlayers);
  };

  // Oyuncu ismini değiştir
  const handleNameChange = (playerId, newName) => {
    const updatedPlayers = players.map(p =>
      p.id === playerId ? { ...p, name: newName } : p,
    );
    setLocalPlayers(updatedPlayers);
  };

  // Kaydet ve geri dön
  const handleSave = () => {
    // Boş isimleri varsayılan isimle doldur
    const finalPlayers = players.map((p, index) => ({
      ...p,
      name: p.name.trim() || `${t('game.player')} ${index + 1}`,
    }));

    setPlayers(finalPlayers);
    setPlayerCount(finalPlayers.length);
    navigation.goBack();
  };

  const getInitial = (name, index) =>
    name.trim().charAt(0).toLocaleUpperCase() || String(index + 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgGlow} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('playerSetup.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Oyuncu sayısı özeti */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Icon name="people" size={22} color={colors.accentPrimary} />
        </View>
        <View style={styles.summaryInfo}>
          <Text style={styles.summaryTitle}>
            {players.length} {t('playerSetup.players')}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(players.length / MAX_PLAYERS) * 100}%` },
              ]}
            />
          </View>
        </View>
        <Text style={styles.summaryCount}>
          {players.length}
          <Text style={styles.summaryMax}> / {MAX_PLAYERS}</Text>
        </Text>
      </View>

      {/* Oyuncu Listesi */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {players.map((player, index) => {
          const isFocused = focusedId === player.id;
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

          return (
            <View
              key={player.id}
              style={[styles.playerCard, isFocused && styles.playerCardFocused]}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>
                  {getInitial(player.name, index)}
                </Text>
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.playerInput}
                  value={player.name}
                  onChangeText={text => handleNameChange(player.id, text)}
                  onFocus={() => setFocusedId(player.id)}
                  onBlur={() => setFocusedId(null)}
                  placeholder={`${t('game.player')} ${index + 1}`}
                  placeholderTextColor={colors.textMuted}
                  maxLength={20}
                  returnKeyType="done"
                  selectTextOnFocus
                />
                <Icon
                  name="pencil"
                  size={14}
                  color={isFocused ? colors.accentPrimary : colors.textMuted}
                />
              </View>

              <TouchableOpacity
                style={[styles.removeButton, isAtMin && styles.buttonDimmed]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => handleRemovePlayer(player.id)}
              >
                <Icon name="trash-outline" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Oyuncu Ekle Butonu */}
        <TouchableOpacity
          style={[styles.addPlayerButton, isAtMax && styles.buttonDimmed]}
          activeOpacity={0.7}
          onPress={handleAddPlayer}
        >
          <View style={styles.addPlayerIcon}>
            <Icon name="add" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.addPlayerText}>{t('playerSetup.addPlayer')}</Text>
        </TouchableOpacity>

        <View style={styles.hintRow}>
          <Icon
            name="information-circle-outline"
            size={16}
            color={colors.textMuted}
          />
          <Text style={styles.hintText}>{t('playerSetup.hint')}</Text>
        </View>
      </ScrollView>

      {/* Kaydet */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <Icon name="checkmark" size={22} color={colors.textPrimary} />
          <Text style={styles.saveButtonText}>{t('playerSetup.save')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  bgGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    top: -90,
    right: -90,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 42,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  summaryInfo: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.bgCardLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accentPrimary,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 14,
  },
  summaryMax: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  playerCardFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCardLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  playerInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  removeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDimmed: {
    opacity: 0.35,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    gap: 10,
  },
  addPlayerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlayerText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accentSecondary,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  hintText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgPrimary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});

export default PlayerSetupScreen;
