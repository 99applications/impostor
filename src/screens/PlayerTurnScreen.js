import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { vibrate } from '../utils/helpers';
import {
  AppLogo,
  GlassCard,
  GradientButton,
  IconTile,
  PlayerAvatar,
  ScreenBackground,
} from '../components/ui';

// Oyuncu sırasını gösteren parçalı ilerleme çubuğu.
const SegmentedProgress = ({ total, current }) => (
  <View style={styles.segments}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.segment,
          i < current && styles.segmentDone,
          i === current && styles.segmentCurrent,
        ]}
      />
    ))}
  </View>
);

const PlayerTurnScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, nextPlayer } = useGame();

  const [isRevealed, setIsRevealed] = useState(false);
  const [gamePhase, setGamePhase] = useState('viewing'); // 'viewing' | 'playing'
  const [timeLeft, setTimeLeft] = useState(state.gameDuration);
  const timerRef = useRef(null);
  const flip = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

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
            vibrate([0, 500, 200, 500]);
            navigation.replace('Voting');
            return 0;
          }

          // Son 10 saniyede titreşim
          if (prev <= 11 && prev > 1) {
            vibrate(100);
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

  // Süre kritik mi?
  const isCritical = timeLeft <= 30 && timeLeft > 0;
  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const hasTimer = state.gameDuration > 0;

  // Son saniyelerde sayaç nabız gibi atar.
  useEffect(() => {
    if (gamePhase !== 'playing' || !hasTimer || !isUrgent) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [gamePhase, hasTimer, isUrgent, pulse]);

  // Kart çevirme: yarıya kadar döner, içerik değişir, geri döner.
  const handleReveal = () => {
    Animated.timing(flip, {
      toValue: 0,
      duration: 140,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setIsRevealed(prev => !prev);
      Animated.spring(flip, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    setIsRevealed(false);
    flip.setValue(1);
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
    navigation.replace('Voting');
  };

  // Oyun fazı: Tartışma ekranı
  if (gamePhase === 'playing') {
    const timerColor = isUrgent
      ? colors.danger
      : isCritical
      ? colors.warning
      : colors.accentPrimary;
    const progress = hasTimer ? timeLeft / state.gameDuration : 1;

    return (
      <ScreenBackground
        glow={isUrgent ? 'danger' : isCritical ? 'warning' : 'violet'}
      >
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.playingHeader}>
            <View style={styles.headerChip}>
              <Icon name="people" size={16} color={colors.accentSecondary} />
              <Text style={styles.headerChipText}>
                {state.players.length} {t('game.players')}
              </Text>
            </View>
            <View style={styles.headerChip}>
              <Icon name="skull" size={14} color={colors.danger} />
              <Text style={styles.headerChipText}>
                {state.imposterCount} {t('game.imposters')}
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.playingContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Sayaç */}
            <Animated.View
              style={[
                styles.timerOuter,
                {
                  borderColor: withAlpha(timerColor, 0.25),
                  shadowColor: timerColor,
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.06],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[withAlpha(timerColor, 0.35), withAlpha(timerColor, 0.08)]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={[styles.timerInner, { borderColor: timerColor }]}
              >
                {hasTimer ? (
                  <>
                    <Icon name="timer-outline" size={22} color={timerColor} />
                    <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    <View style={styles.timerTrack}>
                      <View
                        style={[
                          styles.timerFill,
                          {
                            width: `${progress * 100}%`,
                            backgroundColor: timerColor,
                          },
                        ]}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <Icon
                      name="chatbubbles"
                      size={64}
                      color={colors.textPrimary}
                    />
                    <Icon
                      name="infinite"
                      size={26}
                      color={colors.accentSecondary}
                    />
                  </>
                )}
              </LinearGradient>
            </Animated.View>

            <Text style={styles.playingTitle}>{t('game.discussTitle')}</Text>
            <Text style={styles.playingSubtitle}>
              {t('game.discussSubtitle')}
            </Text>

            <GlassCard style={styles.modeCard}>
              <IconTile
                name={state.gameMode === 'word' ? 'text' : 'help-circle'}
                size={40}
                gradient={
                  state.gameMode === 'word'
                    ? gradients.success
                    : gradients.warning
                }
                soft
              />
              <View style={styles.modeInfo}>
                <Text style={styles.modeLabel}>{t('game.mode')}</Text>
                <Text style={styles.modeValue}>
                  {state.gameMode === 'word'
                    ? t('setup.wordGame')
                    : t('setup.questionGame')}
                </Text>
              </View>
            </GlassCard>

            {/* İpuçları */}
            <GlassCard style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>{t('game.tips')}</Text>
              {['tip1', 'tip2', 'tip3'].map((tip, index) => (
                <View key={tip} style={styles.tipItem}>
                  <View style={styles.tipNumber}>
                    <Text style={styles.tipNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.tipText}>{t(`game.${tip}`)}</Text>
                </View>
              ))}
            </GlassCard>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <GradientButton
              title={t('game.startVoting')}
              icon="hand-left"
              variant="danger"
              onPress={handleEndGame}
            />
          </View>
        </View>
      </ScreenBackground>
    );
  }

  const playerName =
    currentPlayer?.name || `${t('game.player')} ${state.currentPlayerIndex + 1}`;

  // Rol görme fazı
  const renderContent = () => {
    if (!isRevealed) {
      return (
        <View style={styles.hiddenContent}>
          <AppLogo size={96} />
          <Text style={styles.hiddenName}>{playerName}</Text>
          <View style={styles.tapPill}>
            <Icon name="hand-left-outline" size={16} color={colors.textPrimary} />
            <Text style={styles.tapPillText}>{t('game.tapToReveal')}</Text>
          </View>
        </View>
      );
    }

    if (isImposter) {
      return (
        <View style={styles.revealContent}>
          <IconTile name="skull" size={92} gradient={gradients.danger} round />
          <Text style={styles.imposterTitle}>{t('game.youAreImposter')}</Text>

          {state.gameMode === 'question' &&
            (state.currentQuestionKey || state.currentWord) && (
              <View style={styles.infoBox}>
                <Icon name="help-circle" size={18} color={colors.warning} />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>{t('game.yourQuestion')}</Text>
                  <Text style={styles.infoValue}>
                    {state.currentWord ||
                      t(`${state.currentQuestionKey}.imposter`)}
                  </Text>
                </View>
              </View>
            )}

          {state.showCategoryToImposter && state.currentCategory && (
            <View style={styles.infoBox}>
              <Icon name="folder" size={18} color={colors.accentSecondary} />
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>{t('game.category')}</Text>
                <Text style={styles.infoValue}>
                  {state.customCategories?.[state.currentCategory]?.name ||
                    t(`categories.${state.currentCategory}`)}
                </Text>
              </View>
            </View>
          )}

          {state.gameMode === 'word' &&
            state.showHintToImposter &&
            state.currentHintKey && (
              <View style={styles.infoBox}>
                <Icon name="bulb" size={18} color={colors.warning} />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoLabel}>{t('game.imposterHint')}</Text>
                  <Text style={styles.infoValue}>{t(state.currentHintKey)}</Text>
                </View>
              </View>
            )}
        </View>
      );
    }

    const isWordMode = state.gameMode === 'word';

    return (
      <View style={styles.revealContent}>
        <IconTile
          name={isWordMode ? 'text' : 'help-circle'}
          size={84}
          gradient={gradients.success}
          round
        />
        <Text style={styles.contentLabel}>
          {isWordMode ? t('game.yourWord') : t('game.yourQuestion')}
        </Text>
        <Text style={[styles.contentValue, !isWordMode && styles.questionValue]}>
          {isWordMode
            ? state.currentWord || t(state.currentWordKey)
            : state.currentWord || t(`${state.currentQuestionKey}.normal`)}
        </Text>
      </View>
    );
  };

  const cardGradient = !isRevealed
    ? ['#2a2152', '#171430']
    : isImposter
    ? ['#5b1a2b', '#23122a']
    : ['#0f4a3c', '#10202a'];
  const cardBorder = !isRevealed
    ? withAlpha(colors.accentPrimary, 0.45)
    : isImposter
    ? colors.danger
    : colors.success;

  return (
    <ScreenBackground
      glow={!isRevealed ? 'violet' : isImposter ? 'danger' : 'success'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.playerRow}>
            <PlayerAvatar
              name={playerName}
              index={state.currentPlayerIndex}
              size={40}
            />
            <View>
              <Text style={styles.playerName} numberOfLines={1}>
                {playerName}
              </Text>
              <Text style={styles.playerMeta}>
                {state.currentPlayerIndex + 1} / {state.players.length}
              </Text>
            </View>
          </View>
        </View>

        <SegmentedProgress
          total={state.players.length}
          current={state.currentPlayerIndex}
        />

        {/* İçerik Kartı */}
        <View style={styles.content}>
          <Animated.View
            style={{
              transform: [
                { perspective: 1200 },
                {
                  rotateY: flip.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['90deg', '0deg'],
                  }),
                },
              ],
            }}
          >
            <Pressable onPress={handleReveal}>
              <LinearGradient
                colors={cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, { borderColor: cardBorder }]}
              >
                {renderContent()}

                {isRevealed && (
                  <View style={styles.tapToHideWrapper}>
                    <Icon
                      name="eye-off-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.tapToHide}>{t('game.tapToHide')}</Text>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* Alt butonlar */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {!isRevealed ? (
            <View style={styles.readyRow}>
              <Icon name="eye-off" size={18} color={colors.textMuted} />
              <Text style={styles.footerHint}>{t('game.ready')}</Text>
            </View>
          ) : (
            <GradientButton
              title={isLastPlayer ? t('game.startDiscussion') : t('game.next')}
              iconRight={isLastPlayer ? 'chatbubbles' : 'arrow-forward'}
              variant={isLastPlayer ? 'brand' : 'primary'}
              onPress={handleNext}
            />
          )}

          {isRevealed && !isLastPlayer && (
            <View style={styles.passPhoneWrapper}>
              <Icon name="swap-horizontal" size={16} color={colors.textMuted} />
              <Text style={styles.passPhoneHint}>{t('game.passPhone')}</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  playerMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 20,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentDone: {
    backgroundColor: withAlpha(colors.accentPrimary, 0.55),
  },
  segmentCurrent: {
    backgroundColor: colors.accentPink,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 24,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  hiddenContent: {
    alignItems: 'center',
  },
  hiddenName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 32,
    textAlign: 'center',
  },
  tapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tapPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  revealContent: {
    alignItems: 'center',
    width: '100%',
  },
  imposterTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: withAlpha(colors.danger, 0.8),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  contentLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a7f3d0',
    marginTop: 22,
    marginBottom: 8,
  },
  contentValue: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: withAlpha(colors.success, 0.7),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  questionValue: {
    fontSize: 22,
    lineHeight: 30,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 10,
    gap: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  tapToHideWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 6,
  },
  tapToHide: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  readyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
  },
  footerHint: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  passPhoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  passPhoneHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  // Tartışma fazı
  playingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  playingContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  timerOuter: {
    width: 228,
    height: 228,
    borderRadius: 114,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 26,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  timerInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 54,
    fontWeight: '900',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  timerTrack: {
    width: 96,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  playingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  playingSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    padding: 12,
    gap: 12,
    marginBottom: 12,
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  modeValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tipsCard: {
    alignSelf: 'stretch',
    padding: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  tipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: withAlpha(colors.accentPrimary, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.accentSecondary,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

export default PlayerTurnScreen;
