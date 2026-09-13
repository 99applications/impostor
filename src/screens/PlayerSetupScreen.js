import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import {
  GlassCard,
  GradientButton,
  IconButton,
  PlayerAvatar,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
} from '../components/ui';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 20;

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

  const fillPercent = (players.length / MAX_PLAYERS) * 100;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title={t('playerSetup.title')}
          onBack={() => navigation.goBack()}
        />

        {/* Oyuncu sayısı özeti */}
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryCount}>
                {players.length}
                <Text style={styles.summaryMax}> / {MAX_PLAYERS}</Text>
              </Text>
              <Text style={styles.summaryLabel}>{t('playerSetup.players')}</Text>
            </View>
            <View style={styles.summaryAvatars}>
              {players.slice(0, 6).map((player, index) => (
                <PlayerAvatar
                  key={player.id}
                  name={player.name}
                  index={index}
                  size={30}
                  style={[styles.summaryAvatar, index > 0 && styles.overlap]}
                />
              ))}
              {players.length > 6 && (
                <View style={[styles.moreBubble, styles.overlap]}>
                  <Text style={styles.moreText}>+{players.length - 6}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${fillPercent}%` }]}
            />
          </View>
        </GlassCard>

        {/* Oyuncu Listesi */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {players.map((player, index) => {
            const isFocused = focusedId === player.id;

            return (
              <GlassCard
                key={player.id}
                active={isFocused}
                style={styles.playerCard}
              >
                <PlayerAvatar name={player.name} index={index} size={44} />

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
                    color={isFocused ? colors.accentSecondary : colors.textMuted}
                  />
                </View>

                <IconButton
                  name="trash-outline"
                  variant="danger"
                  size={38}
                  iconSize={17}
                  style={isAtMin && styles.buttonDimmed}
                  onPress={() => handleRemovePlayer(player.id)}
                />
              </GlassCard>
            );
          })}

          {/* Oyuncu Ekle Butonu */}
          <PressableScale
            style={[styles.addPlayerButton, isAtMax && styles.buttonDimmed]}
            onPress={handleAddPlayer}
          >
            <LinearGradient
              colors={gradients.primary}
              style={styles.addPlayerIcon}
            >
              <Icon name="add" size={22} color={colors.textPrimary} />
            </LinearGradient>
            <Text style={styles.addPlayerText}>{t('playerSetup.addPlayer')}</Text>
          </PressableScale>

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
          <GradientButton
            title={t('playerSetup.save')}
            icon="checkmark"
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  summaryCount: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  summaryMax: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  summaryAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryAvatar: {
    borderColor: colors.bgCard,
    borderWidth: 2,
  },
  overlap: {
    marginLeft: -10,
  },
  moreBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgCardLight,
    borderWidth: 2,
    borderColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  playerInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: 8,
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
    borderColor: withAlpha(colors.accentPrimary, 0.6),
    borderStyle: 'dashed',
    backgroundColor: withAlpha(colors.accentPrimary, 0.08),
    gap: 10,
  },
  addPlayerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlayerText: {
    fontSize: 16,
    fontWeight: '800',
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
  },
});

export default PlayerSetupScreen;
