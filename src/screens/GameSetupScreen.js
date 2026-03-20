import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { CATEGORIES, getMaxImposters } from '../data/gameData';

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
    toggleTrollMode
  } = useGame();

  const maxImposters = getMaxImposters(state.playerCount);

  const handleStartGame = () => {
    startGame();
    navigation.navigate('PlayerTurn');
  };

  const getCategoryPreview = () => {
    const count = state.selectedCategories?.length || 0;
    if (count === 0) return t('categorySelect.noneSelected');

    const categoryIcons = state.selectedCategories.slice(0, 3).map(id => {
      const cat = CATEGORIES[id];
      return cat ? cat.icon : 'folder-outline';
    });

    if (count > 3) {
      return `${count} ${t('categorySelect.selected')}`;
    }
    return `${count} ${t('categorySelect.selected')}`;
  };

  const getTotalContent = () => {
    let words = 0;
    let questions = 0;

    (state.selectedCategories || []).forEach(categoryId => {
      const category = CATEGORIES[categoryId];
      if (category) {
        words += category.wordKeys?.length || 0;
        questions += category.questionKeys?.length || 0;
      }
    });

    return { words, questions };
  };

  const totalContent = getTotalContent();

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

  const formatDuration = duration => {
    if (duration === 0) return t('setup.noLimit');
    if (duration < 60) return `${duration}s`;
    return `${duration / 60} ${t('setup.minutes')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('app.name')}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon
            name="settings-outline"
            size={22}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Oyuncu ve Sahtekar Sayısı */}
        <View style={styles.countersRow}>
          {/* Oyuncu Sayısı */}
          <TouchableOpacity
            onPress={() => navigation.navigate('PlayerSetup')}
            activeOpacity={0.8}
            style={styles.counterCardWrapper}
          >
            <View style={[styles.counterCard, styles.activeCard]}>
              <View style={styles.counterIcon}>
                <Icon name="people" size={24} color={colors.textPrimary} />
              </View>
              <Text style={styles.counterLabel}>{t('setup.playerCount')}</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handlePlayerCountChange(-1)}
                >
                  <Icon name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{state.playerCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handlePlayerCountChange(1)}
                >
                  <Icon name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Sahtekar Sayısı */}
          <View style={styles.counterCardWrapper}>
            <View style={styles.counterCard}>
              <View style={[styles.counterIcon, styles.imposterIcon]}>
                <Icon name="eye" size={24} color={colors.textPrimary} />
              </View>
              <Text style={styles.counterLabel}>
                {t('setup.imposterCount')}
              </Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleImposterCountChange(-1)}
                >
                  <Icon name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{state.imposterCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleImposterCountChange(1)}
                >
                  <Icon name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Oyun Modu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="game-controller-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>{t('setup.gameMode')}</Text>
          </View>
          <View style={styles.gameModeRow}>
            <TouchableOpacity
              style={[
                styles.gameModeCard,
                state.gameMode === 'word' && styles.gameModeCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setGameMode('word')}
            >
              <Icon
                name="text"
                size={28}
                color={
                  state.gameMode === 'word'
                    ? colors.accentPrimary
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.gameModeTitle,
                  state.gameMode === 'word' && styles.gameModeTitleActive,
                ]}
              >
                {t('setup.wordGame')}
              </Text>
              <Text style={styles.gameModeDesc}>{t('setup.wordGameDesc')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gameModeCard,
                state.gameMode === 'question' && styles.gameModeCardActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setGameMode('question')}
            >
              <Icon
                name="help-circle-outline"
                size={28}
                color={
                  state.gameMode === 'question'
                    ? colors.accentPrimary
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  styles.gameModeTitle,
                  state.gameMode === 'question' && styles.gameModeTitleActive,
                ]}
              >
                {t('setup.questionGame')}
              </Text>
              <Text style={styles.gameModeDesc}>
                {t('setup.questionGameDesc')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Süre Seçimi */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="timer-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>{t('setup.duration')}</Text>
          </View>
          <View style={styles.durationRow}>
            {[60, 120, 180, 300, 0].map(duration => {
              const isSelected = state.gameDuration === duration;
              let label;
              if (duration === 0) {
                label = t('setup.noLimit');
              } else if (duration < 60) {
                label = `${duration}s`;
              } else {
                label = `${duration / 60}dk`;
              }

              return (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationCard,
                    isSelected && styles.durationCardActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setGameDuration(duration)}
                >
                  <Icon
                    name={duration === 0 ? 'infinite-outline' : 'time-outline'}
                    size={18}
                    color={isSelected ? colors.accentPrimary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.durationText,
                      isSelected && styles.durationTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Kategoriler */}
        <TouchableOpacity
          style={styles.categoryCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CategorySelect')}
        >
          <View style={styles.categoryCardLeft}>
            <View style={styles.categoryCardIcon}>
              <Icon name="folder-open" size={24} color={colors.textPrimary} />
            </View>
            <View style={styles.categoryCardInfo}>
              <Text style={styles.categoryCardLabel}>
                {t('setup.categories')}
              </Text>
              <Text style={styles.categoryCardValue}>
                {state.selectedCategories?.length || 0}{' '}
                {t('categorySelect.selected')} •{' '}
                {state.gameMode === 'word'
                  ? `${totalContent.words} ${t('categorySelect.words')}`
                  : `${totalContent.questions} ${t(
                      'categorySelect.questions',
                    )}`}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon name="skull-outline" size={20} color={colors.danger} />
            <View style={styles.settingTextWrapper}>
              <Text style={styles.settingText}>{t('setup.trollMode')}</Text>
              <Text style={styles.settingHint}>{t('setup.trollModeHint')}</Text>
            </View>
          </View>
          <Switch
            value={state.trollModeEnabled}
            onValueChange={toggleTrollMode}
            trackColor={{ false: colors.bgCardLight, true: colors.danger }}
            thumbColor={colors.textPrimary}
          />
        </View>

        {/* Ek Ayarlar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="options-outline"
              size={18}
              color={colors.textSecondary}
            />
            <Text style={styles.sectionTitle}>
              {t('setup.additionalSettings')}
            </Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="eye-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.settingText}>
                {t('setup.showCategoryToImposter')}
              </Text>
            </View>
            <Switch
              value={state.showCategoryToImposter}
              onValueChange={toggleShowCategory}
              trackColor={{
                false: colors.bgCardLight,
                true: colors.accentPrimary,
              }}
              thumbColor={colors.textPrimary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon
                name="bulb-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.settingText}>
                {t('setup.showHintToImposter')}
              </Text>
            </View>
            <Switch
              value={state.showHintToImposter}
              onValueChange={toggleShowHint}
              trackColor={{
                false: colors.bgCardLight,
                true: colors.accentPrimary,
              }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Başlat Butonu */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={handleStartGame}
        >
          <Icon name="play" size={22} color={colors.textPrimary} />
          <Text style={styles.startButtonText}>{t('setup.startGame')}</Text>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  countersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  counterCardWrapper: {
    flex: 1,
  },
  counterCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCard: {
    borderColor: colors.accentPrimary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  counterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imposterIcon: {
    backgroundColor: colors.danger,
  },
  counterLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  gameModeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gameModeCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  gameModeCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  gameModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  gameModeTitleActive: {
    color: colors.accentPrimary,
  },
  gameModeDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    minWidth: 70,
  },
  durationCardActive: {
    borderColor: colors.accentPrimary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  durationTextActive: {
    color: colors.accentPrimary,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextWrapper: {
    flex: 1,
  },
  settingHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  categoryCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryCardInfo: {
    flex: 1,
  },
  categoryCardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  categoryCardValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default GameSetupScreen;
