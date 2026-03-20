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
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';

const PlayerSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, setPlayers, setPlayerCount } = useGame();

  // Local state - oyuncu isimleri
  const [players, setLocalPlayers] = useState([]);

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

  // Oyuncu ekle
  const handleAddPlayer = () => {
    if (players.length >= 20) {
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
    if (players.length <= 3) {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('playerSetup.title')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('playerSetup.save')}</Text>
        </TouchableOpacity>
      </View>

      {/* Oyuncu Sayısı Bilgisi */}
      <View style={styles.infoBar}>
        <View style={styles.infoItem}>
          <Text style={styles.infoEmoji}>👥</Text>
          <Text style={styles.infoText}>
            {players.length} {t('playerSetup.players')}
          </Text>
        </View>
      </View>

      {/* Oyuncu Listesi */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerNumber}>
              <Text style={styles.playerNumberText}>{index + 1}</Text>
            </View>

            <TextInput
              style={styles.playerInput}
              value={player.name}
              onChangeText={text => handleNameChange(player.id, text)}
              placeholder={`${t('game.player')} ${index + 1}`}
              placeholderTextColor={colors.textMuted}
              maxLength={20}
            />

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePlayer(player.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Oyuncu Ekle Butonu */}
        <TouchableOpacity
          style={styles.addPlayerButton}
          activeOpacity={0.7}
          onPress={handleAddPlayer}
        >
          <View style={styles.addPlayerIcon}>
            <Text style={styles.addPlayerIconText}>+</Text>
          </View>
          <Text style={styles.addPlayerText}>{t('playerSetup.addPlayer')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Alt Bilgi */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Text style={styles.footerText}>{t('playerSetup.hint')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  infoEmoji: {
    fontSize: 18,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  playerInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.bgCardLight,
    borderRadius: 10,
    marginRight: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: colors.danger,
    fontWeight: '600',
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
    borderStyle: 'dashed',
    gap: 12,
  },
  addPlayerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlayerIconText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  addPlayerText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentPrimary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PlayerSetupScreen;
