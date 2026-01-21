import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';

const PlayerTurnScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, nextPlayer } = useGame();
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isLastPlayer = state.currentPlayerIndex >= state.players.length - 1;
  const isImposter = currentPlayer?.isImposter;

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const handleNext = () => {
    setIsRevealed(false);
    if (isLastPlayer) {
      navigation.replace('GameEnd');
    } else {
      nextPlayer();
    }
  };

  // Gösterilecek içeriği belirle
  const renderContent = () => {
    if (!isRevealed) {
      return (
        <View style={styles.hiddenContent}>
          <Text style={styles.hiddenEmoji}>🙈</Text>
          <Text style={styles.hiddenText}>{t('game.tapToReveal')}</Text>
        </View>
      );
    }

    if (isImposter) {
      return (
        <View style={styles.imposterContent}>
          <Text style={styles.imposterEmoji}>🎭</Text>
          <Text style={styles.imposterTitle}>{t('game.youAreImposter')}</Text>

          {state.showCategoryToImposter && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{t('game.category')}</Text>
              <Text style={styles.infoValue}>
                {t(`categories.${state.selectedCategory}`)}
              </Text>
            </View>
          )}

          {state.showHintToImposter && state.currentHintKey && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{t('game.imposterHint')}</Text>
              <Text style={styles.infoValue}>{t(state.currentHintKey)}</Text>
            </View>
          )}
        </View>
      );
    }

    // Normal oyuncu
    if (state.gameMode === 'word') {
      return (
        <View style={styles.playerContent}>
          <Text style={styles.playerEmoji}>✨</Text>
          <Text style={styles.contentLabel}>{t('game.yourWord')}</Text>
          <Text style={styles.contentValue}>{t(state.currentWordKey)}</Text>
        </View>
      );
    }

    // Soru modu
    return (
      <View style={styles.playerContent}>
        <Text style={styles.playerEmoji}>❓</Text>
        <Text style={styles.contentLabel}>{t('game.yourQuestion')}</Text>
        <Text style={styles.contentValue}>
          {t(`${state.currentQuestionKey}.normal`)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.playerBadge}>
          <Text style={styles.playerBadgeText}>
            {state.players[state.currentPlayerIndex]?.name ||
              `${t('game.player')} ${state.currentPlayerIndex + 1}`}
          </Text>
        </View>
        <Text style={styles.progressText}>
          {state.currentPlayerIndex + 1} / {state.players.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${
                ((state.currentPlayerIndex + 1) / state.players.length) * 100
              }%`,
            },
          ]}
        />
      </View>

      {/* İçerik Kartı */}
      <View style={styles.content}>
        <TouchableOpacity
          style={[
            styles.card,
            isRevealed && isImposter && styles.cardImposter,
            isRevealed && !isImposter && styles.cardPlayer,
          ]}
          activeOpacity={0.9}
          onPress={handleReveal}
        >
          {renderContent()}

          {isRevealed && (
            <Text style={styles.tapToHide}>{t('game.tapToHide')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Alt butonlar */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {!isRevealed ? (
          <Text style={styles.footerHint}>{t('game.ready')}</Text>
        ) : (
          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {isLastPlayer ? t('reveal.title') : t('game.next')}
            </Text>
            <Text style={styles.nextButtonIcon}>→</Text>
          </TouchableOpacity>
        )}

        {isRevealed && !isLastPlayer && (
          <Text style={styles.passPhoneHint}>{t('game.passPhone')}</Text>
        )}
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
  playerBadge: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  playerBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.bgCard,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 32,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardImposter: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cardPlayer: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  hiddenContent: {
    alignItems: 'center',
  },
  hiddenEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  hiddenText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  imposterContent: {
    alignItems: 'center',
  },
  imposterEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  imposterTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.danger,
    marginBottom: 20,
    textAlign: 'center',
  },
  playerContent: {
    alignItems: 'center',
  },
  playerEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  contentLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  contentValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: colors.bgCardLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tapToHide: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nextButtonIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  passPhoneHint: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 12,
  },
});

export default PlayerTurnScreen;
