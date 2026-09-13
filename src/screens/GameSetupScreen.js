import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { CATEGORIES, getMaxImposters } from '../data/gameData';
import {
  GlassCard,
  GradientButton,
  IconButton,
  IconTile,
  PlayerAvatar,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';

const DURATIONS = [60, 120, 180, 300, 0];

// Kart içindeki -/+ sayaç.
const Stepper = ({ value, onDec, onInc, canDec, canInc, accent }) => (
  <View style={styles.stepper}>
    <PressableScale
      style={[styles.stepButton, !canDec && styles.stepButtonDisabled]}
      disabled={!canDec}
      onPress={onDec}
      hitSlop={6}
    >
      <Icon name="remove" size={20} color={colors.textPrimary} />
    </PressableScale>
    <Text style={[styles.stepValue, { textShadowColor: withAlpha(accent, 0.6) }]}>
      {value}
    </Text>
    <PressableScale
      style={[styles.stepButton, !canInc && styles.stepButtonDisabled]}
      disabled={!canInc}
      onPress={onInc}
      hitSlop={6}
    >
      <Icon name="add" size={20} color={colors.textPrimary} />
    </PressableScale>
  </View>
);

const SettingRow = ({ icon, gradient, title, hint, value, onToggle, isLast }) => (
  <View style={[styles.settingRow, !isLast && styles.settingRowBorder]}>
    <IconTile name={icon} size={40} gradient={gradient} soft />
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      {!!hint && <Text style={styles.settingHint}>{hint}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.bgCardLight, true: gradient[1] }}
      thumbColor={colors.textPrimary}
    />
  </View>
);

const GameSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    state,
    setPlayerCount,
    setImposterCount,
    setGameMode,
    setGameDuration,
    toggleShowCategory,
    toggleShowHint,
    startGame,
    toggleTrollMode,
  } = useGame();

  const maxImposters = getMaxImposters(state.playerCount);
  const canDecPlayer = state.playerCount > 3;
  const canIncPlayer = state.playerCount < 20;
  const canDecImposter = state.imposterCount > 1;
  const canIncImposter = state.imposterCount < maxImposters;

  const handleStartGame = () => {
    startGame();
    navigation.navigate('PlayerTurn');
  };

  const getTotalContent = () => {
    let words = 0;
    let questions = 0;

    (state.selectedCategories || []).forEach(categoryId => {
      const custom = state.customCategories?.[categoryId];
      if (custom) {
        words += custom.words?.length || 0;
        questions += custom.questions?.length || 0;
        return;
      }

      const category = CATEGORIES[categoryId];
      if (category) {
        words += category.wordKeys?.length || 0;
        questions += category.questionKeys?.length || 0;
      }
    });

    return { words, questions };
  };

  const totalContent = getTotalContent();
  const selectedCategories = state.selectedCategories || [];

  const handlePlayerCountChange = delta => {
    const newCount = state.playerCount + delta;
    if (newCount >= 3 && newCount <= 20) {
      setPlayerCount(newCount);
      const newMax = getMaxImposters(newCount);
      if (state.imposterCount > newMax) {
        setImposterCount(newMax);
      }
    }
  };

  const handleImposterCountChange = delta => {
    const newCount = state.imposterCount + delta;
    if (newCount >= 1 && newCount <= maxImposters) {
      setImposterCount(newCount);
    }
  };

  const getDurationLabel = duration =>
    duration === 0
      ? t('setup.noLimit')
      : `${duration / 60} ${t('setup.minutes')}`;

  // Oyuncu kartında gösterilecek avatarlar (en fazla 5).
  const previewPlayers = Array.from(
    { length: Math.min(state.playerCount, 5) },
    (_, i) => state.players?.[i]?.name || `${t('game.player')} ${i + 1}`,
  );

  const modes = [
    {
      id: 'word',
      icon: 'text',
      gradient: gradients.success,
      title: t('setup.wordGame'),
      desc: t('setup.wordGameDesc'),
    },
    {
      id: 'question',
      icon: 'help-circle',
      gradient: gradients.warning,
      title: t('setup.questionGame'),
      desc: t('setup.questionGameDesc'),
    },
  ];

  return (
    <ScreenBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader
          title={t('app.name')}
          onBack={() => navigation.goBack()}
          right={
            <IconButton
              name="settings-outline"
              iconSize={20}
              onPress={() => navigation.navigate('Settings')}
            />
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Oyuncu ve Sahtekar Sayısı */}
          <View style={styles.countersRow}>
            <GlassCard
              style={styles.counterCard}
              onPress={() => navigation.navigate('PlayerSetup')}
            >
              <View style={styles.counterTop}>
                <IconTile name="people" size={36} gradient={gradients.primary} />
                <View style={styles.editChip}>
                  <Icon name="pencil" size={11} color={colors.accentSecondary} />
                </View>
              </View>
              <Text style={styles.counterLabel} numberOfLines={2}>
                {t('setup.playerCount')}
              </Text>
              <View style={styles.avatarStack}>
                {previewPlayers.map((name, i) => (
                  <PlayerAvatar
                    key={i}
                    name={name}
                    index={i}
                    size={24}
                    style={[styles.stackAvatar, i > 0 && styles.stackOverlap]}
                  />
                ))}
              </View>
              <Stepper
                value={state.playerCount}
                accent={colors.accentPrimary}
                canDec={canDecPlayer}
                canInc={canIncPlayer}
                onDec={() => handlePlayerCountChange(-1)}
                onInc={() => handlePlayerCountChange(1)}
              />
            </GlassCard>

            <GlassCard style={styles.counterCard}>
              <View style={styles.counterTop}>
                <IconTile name="skull" size={36} gradient={gradients.danger} />
                <Text style={styles.maxText}>
                  {t('setup.max')} {maxImposters}
                </Text>
              </View>
              <Text style={styles.counterLabel} numberOfLines={2}>
                {t('setup.imposterCount')}
              </Text>
              <View style={styles.avatarStack}>
                {Array.from({ length: maxImposters }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.imposterPip,
                      i < state.imposterCount && styles.imposterPipActive,
                    ]}
                  />
                ))}
              </View>
              <Stepper
                value={state.imposterCount}
                accent={colors.danger}
                canDec={canDecImposter}
                canInc={canIncImposter}
                onDec={() => handleImposterCountChange(-1)}
                onInc={() => handleImposterCountChange(1)}
              />
            </GlassCard>
          </View>

          {/* Oyun Modu */}
          <SectionLabel icon="game-controller" title={t('setup.gameMode')} />
          <View style={styles.modeRow}>
            {modes.map(mode => {
              const isActive = state.gameMode === mode.id;
              const accent = mode.gradient[1];
              return (
                <GlassCard
                  key={mode.id}
                  active={isActive}
                  activeColor={accent}
                  style={styles.modeCard}
                  onPress={() => setGameMode(mode.id)}
                >
                  {isActive && (
                    <View style={[styles.modeCheck, { backgroundColor: accent }]}>
                      <Icon
                        name="checkmark"
                        size={12}
                        color={colors.textPrimary}
                      />
                    </View>
                  )}
                  <IconTile
                    name={mode.icon}
                    size={46}
                    gradient={mode.gradient}
                    soft={!isActive}
                  />
                  <Text
                    style={[styles.modeTitle, isActive && styles.modeTitleActive]}
                  >
                    {mode.title}
                  </Text>
                  <Text style={styles.modeDesc}>{mode.desc}</Text>
                </GlassCard>
              );
            })}
          </View>

          {/* Süre */}
          <SectionLabel icon="timer" title={t('setup.duration')} />
          <GlassCard style={styles.durationTrack}>
            {DURATIONS.map(duration => {
              const isSelected = state.gameDuration === duration;
              const label = getDurationLabel(duration);
              return (
                <PressableScale
                  key={duration}
                  style={styles.durationItem}
                  onPress={() => setGameDuration(duration)}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={gradients.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.durationPill}
                    >
                      {duration === 0 ? (
                        <Icon
                          name="infinite"
                          size={20}
                          color={colors.textPrimary}
                        />
                      ) : (
                        <Text style={styles.durationTextActive}>{label}</Text>
                      )}
                    </LinearGradient>
                  ) : (
                    <View style={styles.durationPill}>
                      {duration === 0 ? (
                        <Icon
                          name="infinite"
                          size={20}
                          color={colors.textMuted}
                        />
                      ) : (
                        <Text style={styles.durationText}>{label}</Text>
                      )}
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </GlassCard>
          {state.gameDuration === 0 && (
            <Text style={styles.durationCaption}>{t('setup.noLimit')}</Text>
          )}

          {/* Kategoriler */}
          <SectionLabel
            icon="folder-open"
            title={t('setup.categories')}
            style={styles.sectionSpacing}
          />
          <GlassCard
            style={styles.categoryCard}
            onPress={() => navigation.navigate('CategorySelect')}
          >
            <View style={styles.categoryIcons}>
              {selectedCategories.slice(0, 3).map((id, i) => (
                <IconTile
                  key={id}
                  name={
                    CATEGORIES[id]?.icon ||
                    state.customCategories?.[id]?.icon ||
                    'folder'
                  }
                  size={40}
                  gradient={
                    [gradients.success, gradients.info, gradients.brand][i]
                  }
                  style={[styles.categoryIcon, i > 0 && styles.categoryOverlap]}
                />
              ))}
              {selectedCategories.length === 0 && (
                <IconTile name="folder-open" size={40} soft />
              )}
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryTitle}>
                {selectedCategories.length} {t('categorySelect.selected')}
              </Text>
              <Text style={styles.categoryMeta}>
                {state.gameMode === 'word'
                  ? `${totalContent.words} ${t('categorySelect.words')}`
                  : `${totalContent.questions} ${t('categorySelect.questions')}`}
              </Text>
            </View>
            <Icon name="chevron-forward" size={22} color={colors.textMuted} />
          </GlassCard>

          {/* Ek Ayarlar */}
          <SectionLabel
            icon="options"
            title={t('setup.additionalSettings')}
            style={styles.sectionSpacing}
          />
          <GlassCard style={styles.settingsCard}>
            <SettingRow
              icon="skull"
              gradient={gradients.danger}
              title={t('setup.trollMode')}
              hint={t('setup.trollModeHint')}
              value={state.trollModeEnabled}
              onToggle={toggleTrollMode}
            />
            <SettingRow
              icon="eye"
              gradient={gradients.primary}
              title={t('setup.showCategoryToImposter')}
              value={state.showCategoryToImposter}
              onToggle={toggleShowCategory}
            />
            <SettingRow
              icon="bulb"
              gradient={gradients.warning}
              title={t('setup.showHintToImposter')}
              value={state.showHintToImposter}
              onToggle={toggleShowHint}
              isLast
            />
          </GlassCard>
        </ScrollView>

        {/* Başlat Butonu */}
        <LinearGradient
          colors={[withAlpha(colors.bgPrimary, 0), colors.bgPrimary]}
          locations={[0, 0.35]}
          style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        >
          <GradientButton
            title={t('setup.startGame')}
            icon="play"
            variant="brand"
            onPress={handleStartGame}
          />
        </LinearGradient>
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
    paddingTop: 4,
    paddingBottom: 120,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  counterCard: {
    flex: 1,
    padding: 14,
  },
  counterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: withAlpha(colors.accentPrimary, 0.18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  maxText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    minHeight: 34,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 26,
    marginTop: 6,
    marginBottom: 12,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  stackAvatar: {
    borderColor: colors.bgCard,
  },
  stackOverlap: {
    marginLeft: -8,
  },
  imposterPip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 5,
    backgroundColor: colors.bgCardLight,
  },
  imposterPipActive: {
    backgroundColor: colors.danger,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 4,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.3,
  },
  stepValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 26,
  },
  modeCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  modeTitleActive: {
    color: colors.textPrimary,
  },
  modeDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  durationTrack: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 16,
  },
  durationItem: {
    flex: 1,
  },
  durationPill: {
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  durationTextActive: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  durationCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accentSecondary,
    textAlign: 'right',
    marginTop: 6,
    marginRight: 6,
  },
  sectionSpacing: {
    marginTop: 26,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  categoryIcons: {
    flexDirection: 'row',
    marginRight: 14,
  },
  categoryIcon: {
    borderWidth: 2,
    borderColor: colors.bgCard,
  },
  categoryOverlap: {
    marginLeft: -14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  categoryMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  settingsCard: {
    paddingHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 36,
  },
});

export default GameSetupScreen;
