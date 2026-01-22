import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';

const PlayerTurnScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, nextPlayer } = useGame();

  const [isRevealed, setIsRevealed] = useState(false);
  const [gamePhase, setGamePhase] = useState('viewing'); // 'viewing' | 'playing'
  const [timeLeft, setTimeLeft] = useState(state.gameDuration);
  const timerRef = useRef(null);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isLastPlayer = state.currentPlayerIndex >= state.players.length - 1;
  const isImposter = currentPlayer?.isImposter;

  // Süre formatla (mm:ss)
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Geri sayım başlat
  useEffect(() => {
    if (gamePhase === 'playing' && state.gameDuration > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            Vibration.vibrate([0, 500, 200, 500]);
            navigation.replace('GameEnd', { timeUp: true });
            return 0;
          }

          // Son 10 saniyede titreşim
          if (prev <= 11 && prev > 1) {
            Vibration.vibrate(100);
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gamePhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const handleNext = () => {
    setIsRevealed(false);
    if (isLastPlayer) {
      // Herkes rolünü gördü, oyun başlasın
      setGamePhase('playing');
    } else {
      nextPlayer();
    }
  };

  const handleEndGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigation.replace('GameEnd', { timeUp: false });
  };

  // Süre kritik mi?
  const isCritical = timeLeft <= 30 && timeLeft > 0;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  // Oyun fazı: Tartışma ekranı
  if (gamePhase === 'playing') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Süre Header */}
        <View style={styles.timerHeader}>
          <View style={styles.timerHeaderLeft}>
            <Icon name="people" size={20} color={colors.textSecondary} />
            <Text style={styles.timerHeaderText}>
              {state.players.length} {t('game.players')}
            </Text>
          </View>

          {state.gameDuration > 0 && (
            <View
              style={[
                styles.timerBadge,
                isCritical && styles.timerBadgeCritical,
                isUrgent && styles.timerBadgeUrgent,
              ]}
            >
              <Icon
                name="timer-outline"
                size={18}
                color={
                  isUrgent
                    ? colors.textPrimary
                    : isCritical
                    ? colors.warning
                    : colors.textPrimary
                }
              />
              <Text
                style={[
                  styles.timerText,
                  isCritical && styles.timerTextCritical,
                  isUrgent && styles.timerTextUrgent,
                ]}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar (süre) */}
        {state.gameDuration > 0 && (
          <View style={styles.timerProgressContainer}>
            <View
              style={[
                styles.timerProgress,
                isCritical && styles.timerProgressCritical,
                isUrgent && styles.timerProgressUrgent,
                { width: `${(timeLeft / state.gameDuration) * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Ana içerik */}
        <View style={styles.playingContent}>
          <View style={styles.playingIconWrapper}>
            <Icon name="chatbubbles" size={48} color={colors.accentPrimary} />
          </View>

          <Text style={styles.playingTitle}>{t('game.discussTitle')}</Text>
          <Text style={styles.playingSubtitle}>
            {t('game.discussSubtitle')}
          </Text>

          {/* Oyun bilgileri */}
          <View style={styles.gameInfoCard}>
            <View style={styles.gameInfoRow}>
              <Icon
                name="game-controller-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.gameInfoLabel}>{t('game.mode')}:</Text>
              <Text style={styles.gameInfoValue}>
                {state.gameMode === 'word'
                  ? t('setup.wordGame')
                  : t('setup.questionGame')}
              </Text>
            </View>

            <View style={styles.gameInfoDivider} />

            <View style={styles.gameInfoRow}>
              <Icon
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.gameInfoLabel}>{t('game.imposters')}:</Text>
              <Text style={[styles.gameInfoValue, { color: colors.danger }]}>
                {state.imposterCount}
              </Text>
            </View>
          </View>

          {/* İpuçları */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>{t('game.tips')}</Text>
            <View style={styles.tipItem}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>{t('game.tip1')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>{t('game.tip2')}</Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>{t('game.tip3')}</Text>
            </View>
          </View>
        </View>

        {/* Oyunu Bitir Butonu */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={styles.endGameButton}
            activeOpacity={0.8}
            onPress={handleEndGame}
          >
            <Icon name="flag" size={20} color={colors.textPrimary} />
            <Text style={styles.endGameButtonText}>{t('game.endGame')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Rol görme fazı
  const renderContent = () => {
    if (!isRevealed) {
      return (
        <View style={styles.hiddenContent}>
          <Icon name="eye-off" size={64} color={colors.textMuted} />
          <Text style={styles.hiddenText}>{t('game.tapToReveal')}</Text>
        </View>
      );
    }

    if (isImposter) {
      return (
        <View style={styles.imposterContent}>
          <View style={styles.imposterIconWrapper}>
            <Icon name="skull" size={48} color={colors.danger} />
          </View>
          <Text style={styles.imposterTitle}>{t('game.youAreImposter')}</Text>

          {state.showCategoryToImposter && state.currentCategory && (
            <View style={styles.infoBox}>
              <Icon name="folder-outline" size={18} color={colors.textMuted} />
              <Text style={styles.infoLabel}>{t('game.category')}</Text>
              <Text style={styles.infoValue}>
                {t(`categories.${state.currentCategory}`)}
              </Text>
            </View>
          )}

          {state.showHintToImposter && state.currentHintKey && (
            <View style={styles.infoBox}>
              <Icon name="bulb-outline" size={18} color={colors.warning} />
              <Text style={styles.infoLabel}>{t('game.imposterHint')}</Text>
              <Text style={styles.infoValue}>{t(state.currentHintKey)}</Text>
            </View>
          )}
        </View>
      );
    }

    // Normal oyuncu - Kelime modu
    if (state.gameMode === 'word') {
      return (
        <View style={styles.playerContent}>
          <View style={styles.playerIconWrapper}>
            <Icon name="text" size={40} color={colors.success} />
          </View>
          <Text style={styles.contentLabel}>{t('game.yourWord')}</Text>
          <Text style={styles.contentValue}>{t(state.currentWordKey)}</Text>
        </View>
      );
    }

    // Soru modu
    return (
      <View style={styles.playerContent}>
        <View style={styles.playerIconWrapper}>
          <Icon name="help-circle" size={44} color={colors.success} />
        </View>
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
          <Icon name="person" size={16} color={colors.textPrimary} />
          <Text style={styles.playerBadgeText}>
            {currentPlayer?.name ||
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
            <View style={styles.tapToHideWrapper}>
              <Icon name="eye-off-outline" size={16} color={colors.textMuted} />
              <Text style={styles.tapToHide}>{t('game.tapToHide')}</Text>
            </View>
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
              {isLastPlayer ? t('game.startDiscussion') : t('game.next')}
            </Text>
            <Icon name="arrow-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}

        {isRevealed && !isLastPlayer && (
          <View style={styles.passPhoneWrapper}>
            <Icon name="swap-horizontal" size={16} color={colors.textMuted} />
            <Text style={styles.passPhoneHint}>{t('game.passPhone')}</Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  playerBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
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
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  cardImposter: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cardPlayer: {
    borderColor: colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  hiddenContent: {
    alignItems: 'center',
    gap: 16,
  },
  hiddenText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  imposterContent: {
    alignItems: 'center',
  },
  imposterIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  playerIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCardLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tapToHideWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  tapToHide: {
    fontSize: 14,
    color: colors.textMuted,
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
    gap: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  passPhoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  passPhoneHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  // Tartışma fazı stilleri
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  timerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timerHeaderText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerBadgeCritical: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.warning,
  },
  timerBadgeUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.danger,
  },
  timerText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timerTextCritical: {
    color: colors.warning,
  },
  timerTextUrgent: {
    color: colors.danger,
  },
  timerProgressContainer: {
    height: 4,
    backgroundColor: colors.bgCard,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: 2,
  },
  timerProgressCritical: {
    backgroundColor: colors.warning,
  },
  timerProgressUrgent: {
    backgroundColor: colors.danger,
  },
  playingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  playingIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  playingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  playingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  gameInfoCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gameInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gameInfoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  tipsContainer: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  endGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    gap: 10,
  },
  endGameButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default PlayerTurnScreen;
