import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { getPlayerName } from '../utils/voting';
import {
  FadeInView,
  GlassCard,
  GradientButton,
  PlayerAvatar,
  ScreenBackground,
} from '../components/ui';

// Telefon elden ele dolaşır: her oyuncu kimsenin görmeden oyunu verir.
const VotingScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state } = useGame();
  const { players } = state;

  const [voterIndex, setVoterIndex] = useState(0);
  const [isPassing, setIsPassing] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [votes, setVotes] = useState({});

  const voter = players[voterIndex];
  if (!voter) {
    return null;
  }

  const voterName = getPlayerName(voter, t);
  const candidates = players.filter(p => p.id !== voter.id);
  const indexOf = player => players.findIndex(p => p.id === player.id);

  const handleConfirm = () => {
    if (selectedId === null) {
      return;
    }
    const nextVotes = { ...votes, [voter.id]: selectedId };

    if (voterIndex >= players.length - 1) {
      navigation.replace('GameEnd', { votes: nextVotes });
      return;
    }

    setVotes(nextVotes);
    setSelectedId(null);
    setVoterIndex(voterIndex + 1);
    setIsPassing(true);
  };

  const handleSkip = () => {
    navigation.replace('GameEnd', { votes: null });
  };

  return (
    <ScreenBackground glow={isPassing ? 'violet' : 'danger'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Icon name="hand-left" size={20} color={colors.danger} />
            <Text style={styles.headerTitle}>{t('voting.title')}</Text>
          </View>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {t('voting.progress', {
                current: voterIndex + 1,
                total: players.length,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.segments}>
          {players.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.segment,
                i < voterIndex && styles.segmentDone,
                i === voterIndex && styles.segmentCurrent,
              ]}
            />
          ))}
        </View>

        {isPassing ? (
          <FadeInView key={`pass-${voterIndex}`} style={styles.passContent}>
            <View style={styles.halo}>
              <View style={styles.haloInner} />
              <PlayerAvatar name={voterName} index={voterIndex} size={116} />
            </View>
            <Text style={styles.passTitle}>
              {t('voting.passTo', { name: voterName })}
            </Text>
            <GlassCard style={styles.passNote}>
              <Icon name="eye-off" size={18} color={colors.accentSecondary} />
              <Text style={styles.passNoteText}>{t('voting.passNote')}</Text>
            </GlassCard>
          </FadeInView>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.questionRow}>
              <PlayerAvatar name={voterName} index={voterIndex} size={36} />
              <Text style={styles.question}>
                {t('voting.whoVotes', { name: voterName })}
              </Text>
            </View>

            <View style={styles.grid}>
              {candidates.map(player => {
                const isSelected = selectedId === player.id;
                return (
                  <GlassCard
                    key={player.id}
                    active={isSelected}
                    activeColor={colors.danger}
                    style={styles.candidate}
                    onPress={() => setSelectedId(player.id)}
                  >
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Icon
                          name="hand-left"
                          size={12}
                          color={colors.textPrimary}
                        />
                      </View>
                    )}
                    <PlayerAvatar
                      name={getPlayerName(player, t)}
                      index={indexOf(player)}
                      size={56}
                      style={isSelected && styles.avatarSelected}
                    />
                    <Text
                      style={[
                        styles.candidateName,
                        isSelected && styles.candidateNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {getPlayerName(player, t)}
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          </ScrollView>
        )}

        <View style={[styles.footer, { paddingBottom: insets.bottom + 8 }]}>
          {isPassing ? (
            <GradientButton
              title={t('voting.imReady')}
              icon="eye"
              onPress={() => setIsPassing(false)}
            />
          ) : (
            <GradientButton
              title={t('voting.confirm')}
              icon="hand-left"
              variant="danger"
              disabled={selectedId === null}
              onPress={handleConfirm}
            />
          )}

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>{t('voting.skip')}</Text>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  progressPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  segmentDone: {
    backgroundColor: withAlpha(colors.danger, 0.5),
  },
  segmentCurrent: {
    backgroundColor: colors.danger,
  },
  passContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  halo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: withAlpha(colors.accentPrimary, 0.08),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  haloInner: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: withAlpha(colors.accentPrimary, 0.14),
  },
  passTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 34,
  },
  passNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  passNoteText: {
    flexShrink: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  question: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  candidate: {
    width: '48.2%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: 1.5,
  },
  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSelected: {
    borderColor: colors.danger,
    borderWidth: 3,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 10,
  },
  candidateNameActive: {
    color: colors.textPrimary,
    fontWeight: '900',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default VotingScreen;
