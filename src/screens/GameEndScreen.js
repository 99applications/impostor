import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import { showInterstitialAd } from '../utils/adManager';
import { calculateVoteResult, getPlayerName } from '../utils/voting';
import RatingModal, {
  shouldShowRatingPrompt,
  markRatingPromptShown,
  incrementGamesPlayed,
} from '../components/RatingModal';
import {
  FadeInView,
  GlassCard,
  GradientButton,
  IconTile,
  PlayerAvatar,
  ScreenBackground,
  SectionLabel,
} from '../components/ui';

const VERDICT_STYLES = {
  groupWins: {
    icon: 'shield-checkmark',
    color: colors.success,
    gradient: gradients.success,
    glow: 'success',
  },
  innocentEliminated: {
    icon: 'skull',
    color: colors.danger,
    gradient: gradients.danger,
    glow: 'danger',
  },
  tie: {
    icon: 'git-compare',
    color: colors.warning,
    gradient: gradients.warning,
    glow: 'warning',
  },
  troll: {
    icon: 'happy',
    color: colors.accentPrimary,
    gradient: gradients.brand,
    glow: 'violet',
  },
};

const NO_VOTE_STYLE = {
  icon: 'trophy',
  color: colors.warning,
  gradient: gradients.warning,
  glow: 'warning',
};

const GameEndScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, resetGame, fullReset } = useGame();
  const { isPremium, isLoading: isPremiumLoading } = usePremium();
  const [showRatingModal, setShowRatingModal] = useState(false);

  const imposters = state.players.filter(p => p.isImposter);
  const indexOf = player => state.players.findIndex(p => p.id === player.id);

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
  const verdictStyle = result ? VERDICT_STYLES[result.outcome] : NO_VOTE_STYLE;
  const maxVotes = result ? Math.max(1, ...Object.values(result.counts)) : 1;

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
    <ScreenBackground glow={verdictStyle.glow}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <RatingModal
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Başlık: oylama yapıldıysa kazananı açıkça göster */}
          <FadeInView offset={24}>
            <LinearGradient
              colors={[
                withAlpha(verdictStyle.color, 0.32),
                withAlpha(verdictStyle.color, 0.06),
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.6, y: 1 }}
              style={[
                styles.verdictCard,
                { borderColor: withAlpha(verdictStyle.color, 0.55) },
              ]}
            >
              <View
                style={[
                  styles.verdictHalo,
                  { backgroundColor: withAlpha(verdictStyle.color, 0.14) },
                ]}
              >
                <IconTile
                  name={verdictStyle.icon}
                  size={84}
                  gradient={verdictStyle.gradient}
                  round
                />
              </View>
              <Text
                style={[
                  styles.verdictTitle,
                  { textShadowColor: withAlpha(verdictStyle.color, 0.8) },
                ]}
              >
                {verdict ? verdict.title : t('reveal.title')}
              </Text>
              {!!verdict && (
                <Text style={styles.verdictDesc}>{verdict.desc}</Text>
              )}
            </LinearGradient>
          </FadeInView>

          {/* Sahtekarlar */}
          <FadeInView delay={120} style={styles.section}>
            <SectionLabel
              icon="skull"
              iconColor={colors.danger}
              title={t('reveal.impostersWere')}
            />
            <View style={styles.impostersList}>
              {imposters.map(imposter => (
                <GlassCard
                  key={imposter.id}
                  active
                  activeColor={colors.danger}
                  style={styles.imposterChip}
                >
                  <PlayerAvatar
                    name={getPlayerName(imposter, t)}
                    index={indexOf(imposter)}
                    size={40}
                  />
                  <Text style={styles.imposterName} numberOfLines={1}>
                    {getPlayerName(imposter, t)}
                  </Text>
                  <Icon name="skull" size={16} color={colors.danger} />
                </GlassCard>
              ))}
            </View>
          </FadeInView>

          {/* Kelime/Soru */}
          <FadeInView delay={200} style={styles.section}>
            <SectionLabel
              icon={state.gameMode === 'word' ? 'sparkles' : 'help-circle'}
              iconColor={colors.success}
              title={
                state.gameMode === 'word'
                  ? t('reveal.theWordWas')
                  : t('reveal.theQuestionWas')
              }
            />
            <GlassCard style={styles.answerCard}>
              {state.gameMode === 'word' || state.currentWord ? (
                <Text style={styles.answerText}>
                  {state.currentWord || t(state.currentWordKey)}
                </Text>
              ) : (
                <>
                  <View style={styles.questionBox}>
                    <Text style={styles.questionLabel}>
                      {t('reveal.normalQuestion')}
                    </Text>
                    <Text style={styles.questionText}>
                      {t(`${state.currentQuestionKey}.normal`)}
                    </Text>
                  </View>
                  <View style={[styles.questionBox, styles.questionBoxImposter]}>
                    <Text style={[styles.questionLabel, styles.imposterLabel]}>
                      {t('reveal.imposterQuestion')}
                    </Text>
                    <Text style={styles.questionText}>
                      {t(`${state.currentQuestionKey}.imposter`)}
                    </Text>
                  </View>
                </>
              )}
            </GlassCard>
          </FadeInView>

          {/* Oyuncular: oylama yapıldıysa oy sayılarıyla sıralı */}
          <FadeInView delay={280} style={styles.section}>
            <SectionLabel
              icon={result ? 'bar-chart' : 'people'}
              title={result ? t('result.voteResults') : t('reveal.allPlayers')}
            />
            <GlassCard style={styles.playersList}>
              {(result ? result.ranking : state.players).map(
                (player, index, list) => {
                  const count = result ? result.counts[player.id] : 0;
                  const isEliminated = result?.eliminated?.id === player.id;
                  const isTied =
                    result?.isTie && result.topIds.includes(player.id);

                  return (
                    <View
                      key={player.id}
                      style={[
                        styles.playerItem,
                        index < list.length - 1 && styles.playerItemBorder,
                      ]}
                    >
                      <PlayerAvatar
                        name={getPlayerName(player, t)}
                        index={indexOf(player)}
                        size={38}
                      />
                      <View style={styles.playerInfo}>
                        <View style={styles.playerNameRow}>
                          <Text style={styles.playerName} numberOfLines={1}>
                            {getPlayerName(player, t)}
                          </Text>
                          {player.isImposter && (
                            <View style={styles.imposterBadge}>
                              <Icon
                                name="skull"
                                size={11}
                                color={colors.textPrimary}
                              />
                            </View>
                          )}
                          {isEliminated && (
                            <View style={[styles.tag, styles.tagEliminated]}>
                              <Text style={styles.tagText}>
                                {t('result.eliminated')}
                              </Text>
                            </View>
                          )}
                          {isTied && (
                            <View style={[styles.tag, styles.tagTie]}>
                              <Text style={styles.tagText}>
                                {t('result.tie')}
                              </Text>
                            </View>
                          )}
                        </View>
                        {result && (
                          <View style={styles.voteTrack}>
                            <LinearGradient
                              colors={
                                player.isImposter
                                  ? gradients.danger
                                  : gradients.primary
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                              style={[
                                styles.voteFill,
                                { width: `${(count / maxVotes) * 100}%` },
                              ]}
                            />
                          </View>
                        )}
                      </View>
                      {result && (
                        <Text style={styles.voteCount}>
                          {t('result.votes', { count })}
                        </Text>
                      )}
                    </View>
                  );
                },
              )}
            </GlassCard>
          </FadeInView>
        </ScrollView>

        {/* Butonlar */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton
            title={t('reveal.playAgain')}
            icon="refresh"
            variant="brand"
            onPress={handlePlayAgain}
          />
          <GradientButton
            title={t('reveal.backToMenu')}
            icon="home"
            variant="secondary"
            size="md"
            onPress={handleBackToMenu}
          />
        </View>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  verdictCard: {
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  verdictHalo: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verdictTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  verdictDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  impostersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imposterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 999,
    maxWidth: '100%',
  },
  imposterName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  answerCard: {
    padding: 20,
    alignItems: 'center',
  },
  answerText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    textShadowColor: withAlpha(colors.success, 0.7),
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  questionBox: {
    alignSelf: 'stretch',
    padding: 14,
    borderRadius: 14,
    backgroundColor: withAlpha(colors.success, 0.1),
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  questionBoxImposter: {
    marginTop: 10,
    backgroundColor: withAlpha(colors.danger, 0.1),
    borderLeftColor: colors.danger,
  },
  questionLabel: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '800',
    marginBottom: 4,
  },
  imposterLabel: {
    color: '#fb7185',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  playersList: {
    paddingHorizontal: 14,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  playerItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  imposterBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagEliminated: {
    backgroundColor: colors.danger,
  },
  tagTie: {
    backgroundColor: colors.warning,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  voteTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 8,
    overflow: 'hidden',
  },
  voteFill: {
    height: '100%',
    borderRadius: 3,
  },
  voteCount: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    minWidth: 44,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
});

export default GameEndScreen;
