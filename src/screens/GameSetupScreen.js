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
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { CATEGORIES, getMaxImposters } from '../data/gameData';
import Icon from 'react-native-vector-icons/Ionicons';


const GameSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    state,
    setPlayerCount,
    setImposterCount,
    setGameMode,
    toggleShowCategory,
    toggleShowHint,
    startGame,
  } = useGame();

  const maxImposters = getMaxImposters(state.playerCount);

  const handleStartGame = () => {
    startGame();
    navigation.navigate('PlayerTurn');
  };

  const getCategoryPreview = () => {
    const count = state.selectedCategories?.length || 0;
    if (count === 0) return t('categorySelect.noneSelected');

    const icons = state.selectedCategories
      .slice(0, 3)
      .map(id => CATEGORIES[id]?.icon || '📂')
      .join(' ');

    if (count > 3) {
      return `${icons} +${count - 3}`;
    }
    return icons;
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

  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('app.name')}</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
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
          >
            <View style={[styles.counterCard, styles.activeCard]}>
              <View style={styles.counterIcon}>
                <Text style={styles.counterEmoji}>👥</Text>
              </View>
              <Text style={styles.counterLabel}>{t('setup.playerCount')}</Text>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handlePlayerCountChange(-1)}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{state.playerCount}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handlePlayerCountChange(1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {/* Sahtekar Sayısı */}
          <View style={styles.counterCard}>
            <View style={[styles.counterIcon, styles.imposterIcon]}>
              <Text style={styles.counterEmoji}>🔍</Text>
            </View>
            <Text style={styles.counterLabel}>{t('setup.imposterCount')}</Text>
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleImposterCountChange(-1)}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{state.imposterCount}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => handleImposterCountChange(1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Oyun Modu */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🎲</Text>
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
              <Text style={styles.gameModeIcon}>Tт</Text>
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
              <Text style={styles.gameModeIcon}>❓</Text>
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

        {/* Kategoriler */}
        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CategorySelect')}
        >
          <View style={styles.settingCardLeft}>
            <View style={[styles.settingCardIcon, styles.categoryIconBg]}>
              <Text style={styles.settingCardEmoji}>📂</Text>
            </View>
            <View style={styles.settingCardInfo}>
              <Text style={styles.settingCardLabel}>
                {t('setup.categories')}
              </Text>
              <Text style={styles.settingCardValue}>
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
          <View style={styles.settingCardRight}>
            <Text style={styles.categoryPreview}>{getCategoryPreview()}</Text>
            <Text style={styles.settingCardArrow}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Ayarlar */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>👁️</Text>
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
              <Text style={styles.settingIcon}>💡</Text>
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
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
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
  settingsIcon: {
    fontSize: 20,
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
  counterCard: {
    flex: 1,
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
  counterEmoji: {
    fontSize: 24,
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
  counterButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
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
  sectionIcon: {
    fontSize: 18,
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
  gameModeIcon: {
    fontSize: 28,
    marginBottom: 8,
    color: colors.textSecondary,
  },
  gameModeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
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
  // Kategori Kartı Stilleri
  settingCard: {
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
  settingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryIconBg: {
    backgroundColor: colors.success,
  },
  settingCardEmoji: {
    fontSize: 24,
  },
  settingCardInfo: {
    flex: 1,
  },
  settingCardLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  settingCardValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  settingCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPreview: {
    fontSize: 22,
  },
  settingCardArrow: {
    fontSize: 24,
    color: colors.textMuted,
  },
  // Toggle Ayarları
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
  },
  settingIcon: {
    fontSize: 18,
    marginRight: 12,
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
    backgroundColor: colors.accentPrimary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
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
