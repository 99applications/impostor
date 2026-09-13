import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import { showInterstitialAd } from '../utils/adManager';
import { calculateVoteResult, getPlayerName } from '../utils/voting';
import RatingModal, {
  shouldShowRatingPrompt,
  markRatingPromptShown,
  incrementGamesPlayed,
} from '../components/RatingModal';

const VERDICT_STYLES = {
  groupWins: {
    icon: 'shield-checkmark',
    color: colors.success,
    bg: 'rgba(16, 185, 129, 0.15)',
  },
  innocentEliminated: {
    icon: 'skull',
    color: colors.danger,
    bg: 'rgba(239, 68, 68, 0.15)',
  },
  tie: {
    icon: 'git-compare',
    color: colors.warning,
    bg: 'rgba(245, 158, 11, 0.15)',
  },
  troll: {
    icon: 'happy',
    color: colors.accentPrimary,
    bg: 'rgba(139, 92, 246, 0.15)',
  },
};

const GameEndScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, resetGame, fullReset } = useGame();
  const { isPremium, isLoading: isPremiumLoading } = usePremium();
  const [showRatingModal, setShowRatingModal] = useState(false);

  const imposters = state.players.filter(p => p.isImposter);

  // Oylama yapıldıysa sonucu hesapla; atlandıysa sadece açıklama gösterilir.
  const votes = route?.params?.votes;
  const result = votes
    ? calculateVoteResult(state.players, votes, state.isTrollRound)
    : null;

  const getVerdictText = () => {
    if (!result) {
      return null;
    }
    switch (result.outcome) {
      case 'groupWins':
        return {
          title: t('result.groupWinsTitle'),
          desc: t('result.groupWinsDesc', {
            name: getPlayerName(result.eliminated, t),
          }),
        };
      case 'innocentEliminated':
        return {
          title: t('result.imposterWinsTitle'),
          desc: t('result.innocentEliminatedDesc', {
            name: getPlayerName(result.eliminated, t),
          }),
        };
      case 'tie': {
        const names = state.players
          .filter(p => result.topIds.includes(p.id))
          .map(p => getPlayerName(p, t))
          .join(', ');
        return {
          title: t('result.imposterWinsTitle'),
          desc: names
            ? t('result.tieDesc', { names })
            : t('result.noVotesDesc'),
        };
      }
      default:
        return { title: t('result.trollTitle'), desc: t('result.trollDesc') };
    }
  };

  const verdict = getVerdictText();
  const verdictStyle = result ? VERDICT_STYLES[result.outcome] : null;

  useEffect(() => {
    // Wait until premium status is known so subscribers don't see a flash ad
    if (isPremiumLoading) return;
    if (!isPremium) {
      showInterstitialAd(null);
    }
  }, [isPremium, isPremiumLoading]);

  useEffect(() => {
    const checkRating = async () => {
      try {
        await incrementGamesPlayed();
        const canShow = await shouldShowRatingPrompt({ requireMinGames: true });
        if (canShow) {
          markRatingPromptShown();
          setTimeout(() => setShowRatingModal(true), 1500);
        }
      } catch (e) {}
    };
    checkRating();
  }, []);

  const handlePlayAgain = () => {
    resetGame();
    navigation.replace('PlayerTurn');
  };

  const handleBackToMenu = () => {
    fullReset();
    navigation.replace('Home');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
      {/* Arka plan efektleri */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık: oylama yapıldıysa kazananı açıkça göster */}
        {verdict ? (
          <View
            style={[
              styles.verdictCard,
              {
                backgroundColor: verdictStyle.bg,
                borderColor: verdictStyle.color,
              },
            ]}
          >
            <Icon
              name={verdictStyle.icon}
              size={56}
              color={verdictStyle.color}
            />
            <Text style={[styles.verdictTitle, { color: verdictStyle.color }]}>
              {verdict.title}
            </Text>
            <Text style={styles.verdictDesc}>{verdict.desc}</Text>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.headerIconWrapper}>
              <Icon name="trophy" size={52} color={colors.warning} />
            </View>
            <Text style={styles.title}>{t('reveal.title')}</Text>
          </View>
        )}

        {/* Sahtekarlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reveal.impostersWere')}</Text>
          <View style={styles.impostersList}>
            {imposters.map(imposter => (
              <View key={imposter.id} style={styles.imposterCard}>
                <View style={styles.imposterIcon}>
                  <Icon name="skull" size={24} color={colors.textPrimary} />
                </View>
                <Text style={styles.imposterName}>
                  {getPlayerName(imposter, t)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Kelime/Soru */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {state.gameMode === 'word'
              ? t('reveal.theWordWas')
              : t('reveal.theQuestionWas')}
          </Text>
          <View style={styles.answerCard}>
            {state.gameMode === 'word' ? (
              <>
                <Icon
                  name="sparkles"
                  size={40}
                  color={colors.success}
                  style={styles.answerIcon}
                />
                <Text style={styles.answerText}>
                  {state.currentWord || t(state.currentWordKey)}
                </Text>
              </>
            ) : (
              <>
                <Icon
                  name="help-circle"
                  size={40}
                  color={colors.accentPrimary}
                  style={styles.answerIcon}
                />
                {state.currentWord ? (
                  <Text style={styles.answerText}>{state.currentWord}</Text>
                ) : (
                  <>
                    <View style={styles.questionBox}>
                      <Text style={styles.questionLabel}>Normal:</Text>
                      <Text style={styles.questionText}>
                        {t(`${state.currentQuestionKey}.normal`)}
                      </Text>
                    </View>
                    <View style={styles.questionBox}>
                      <Text
                        style={[styles.questionLabel, styles.imposterLabel]}
                      >
                        Sahtekar:
                      </Text>
                      <Text style={styles.questionText}>
                        {t(`${state.currentQuestionKey}.imposter`)}
                      </Text>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Oyuncular: oylama yapıldıysa oy sayılarıyla sıralı */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {result ? t('result.voteResults') : t('reveal.allPlayers')}
          </Text>
          <View style={styles.playersList}>
            {(result ? result.ranking : state.players).map(player => (
              <View
                key={player.id}
                style={[
                  styles.playerItem,
                  player.isImposter && styles.playerItemImposter,
                ]}
              >
                <View style={styles.playerInfo}>
                  <Text style={styles.playerNumber}>
                    {getPlayerName(player, t)}
                  </Text>
                  {result && (
                    <View style={styles.tagRow}>
                      {result.eliminated?.id === player.id && (
                        <View style={[styles.tag, styles.tagEliminated]}>
                          <Text style={styles.tagText}>
                            {t('result.eliminated')}
                          </Text>
                        </View>
                      )}
                      {result.isTie && result.topIds.includes(player.id) && (
                        <View style={[styles.tag, styles.tagTie]}>
                          <Text style={styles.tagText}>{t('result.tie')}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                {result && (
                  <Text style={styles.voteCount}>
                    {t('result.votes', { count: result.counts[player.id] })}
                  </Text>
                )}
                {player.isImposter && (
                  <View style={styles.imposterBadge}>
                    <Text style={styles.imposterBadgeText}>🎭</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Butonlar */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handlePlayAgain}
        >
          <Text style={styles.primaryButtonText}>{t('reveal.playAgain')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={handleBackToMenu}
        >
          <Text style={styles.secondaryButtonText}>
            {t('reveal.backToMenu')}
          </Text>
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
  bgCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.accentGlow,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    bottom: 150,
    left: -60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  impostersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  imposterCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 2,
    borderColor: colors.danger,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  imposterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imposterName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  answerCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  answerIcon: {
    marginBottom: 12,
  },
  answerText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.success,
    textAlign: 'center',
  },
  questionBox: {
    width: '100%',
    marginTop: 12,
  },
  questionLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  imposterLabel: {
    color: colors.danger,
  },
  questionText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  playersList: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerItemImposter: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  playerNumber: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  playerInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagEliminated: {
    backgroundColor: colors.danger,
  },
  tagTie: {
    backgroundColor: colors.warning,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  voteCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginHorizontal: 10,
  },
  verdictCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  verdictTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  verdictDesc: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  imposterBadge: {
    backgroundColor: colors.danger,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  imposterBadgeText: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  secondaryButton: {
    backgroundColor: colors.bgCard,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default GameEndScreen;
