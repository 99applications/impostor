import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';

const GameEndScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, resetGame, fullReset } = useGame();

  const imposters = state.players.filter(p => p.isImposter);

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
      {/* Arka plan efektleri */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{t('reveal.title')}</Text>
        </View>

        {/* Sahtekarlar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reveal.impostersWere')}</Text>
          <View style={styles.impostersList}>
            {imposters.map(imposter => (
              <View key={imposter.id} style={styles.imposterCard}>
                <View style={styles.imposterIcon}>
                  <Text style={styles.imposterEmoji}>🎭</Text>
                </View>
                <Text style={styles.imposterName}>
                  {t('game.player')} {imposter.id}
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
                <Text style={styles.answerEmoji}>✨</Text>
                <Text style={styles.answerText}>{t(state.currentWordKey)}</Text>
              </>
            ) : (
              <>
                <Text style={styles.answerEmoji}>❓</Text>
                <View style={styles.questionBox}>
                  <Text style={styles.questionLabel}>Normal:</Text>
                  <Text style={styles.questionText}>
                    {t(`${state.currentQuestionKey}.normal`)}
                  </Text>
                </View>
                <View style={styles.questionBox}>
                  <Text style={[styles.questionLabel, styles.imposterLabel]}>
                    Sahtekar:
                  </Text>
                  <Text style={styles.questionText}>
                    {t(`${state.currentQuestionKey}.imposter`)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Tüm oyuncular listesi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tüm Oyuncular</Text>
          <View style={styles.playersList}>
            {state.players.map(player => (
              <View
                key={player.id}
                style={[
                  styles.playerItem,
                  player.isImposter && styles.playerItemImposter,
                ]}
              >
                <Text style={styles.playerNumber}>
                  {t('game.player')} {player.id}
                </Text>
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
  emoji: {
    fontSize: 64,
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
  imposterEmoji: {
    fontSize: 24,
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
  answerEmoji: {
    fontSize: 40,
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
