import React, { useState } from 'react';
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
import { getPlayerName } from '../utils/voting';

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('voting.title')}</Text>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>
            {t('voting.progress', {
              current: voterIndex + 1,
              total: players.length,
            })}
          </Text>
        </View>
      </View>

      {isPassing ? (
        <View style={styles.passContent}>
          <View style={styles.passIcon}>
            <Icon
              name="phone-portrait"
              size={48}
              color={colors.accentPrimary}
            />
          </View>
          <Text style={styles.passTitle}>
            {t('voting.passTo', { name: voterName })}
          </Text>
          <Text style={styles.passNote}>{t('voting.passNote')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.question}>
            {t('voting.whoVotes', { name: voterName })}
          </Text>

          {candidates.map(player => {
            const isSelected = selectedId === player.id;
            return (
              <TouchableOpacity
                key={player.id}
                style={[styles.candidate, isSelected && styles.candidateActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedId(player.id)}
              >
                <View
                  style={[styles.avatar, isSelected && styles.avatarActive]}
                >
                  <Icon
                    name="person"
                    size={20}
                    color={isSelected ? colors.textPrimary : colors.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.candidateName,
                    isSelected && styles.candidateNameActive,
                  ]}
                >
                  {getPlayerName(player, t)}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && (
                    <Icon
                      name="checkmark"
                      size={16}
                      color={colors.textPrimary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {isPassing ? (
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => setIsPassing(false)}
          >
            <Text style={styles.primaryButtonText}>{t('voting.imReady')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              selectedId === null && styles.primaryButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={selectedId === null}
            onPress={handleConfirm}
          >
            <Icon name="hand-left" size={20} color={colors.textPrimary} />
            <Text style={styles.primaryButtonText}>{t('voting.confirm')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('voting.skip')}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  progressPill: {
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  passContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  passIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  passTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  passNote: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  question: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  candidate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  candidateActive: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarActive: {
    backgroundColor: colors.danger,
  },
  candidateName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  candidateNameActive: {
    color: colors.textPrimary,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default VotingScreen;
