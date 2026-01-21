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

const GameSetupScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    state,
    setPlayerCount,
    setImposterCount,
    setGameMode,
    setCategory,
    toggleShowCategory,
    toggleShowHint,
    startGame,
  } = useGame();

  const maxImposters = getMaxImposters(state.playerCount);

  const handleStartGame = () => {
    startGame();
    navigation.navigate('PlayerTurn');
  };

  const handlePlayerCountChange = delta => {
    const newCount = state.playerCount + delta;
    if (newCount >= 3 && newCount <= 20) {
      setPlayerCount(newCount);
      // Sahtekar sayısını kontrol et
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

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Oyuncu ve Sahtekar Sayısı */}
        <View style={styles.countersRow}>
          {/* Oyuncu Sayısı */}
          {/* Oyuncu Sayısı */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PlayerSetup');
            }}
            activeOpacity={0.8} // Tıklama efektini yumuşatır
            // style={styles.playerCard} <-- Bunu buradan kaldırıyoruz
          >
            {/* Stili buraya array olarak ekliyoruz: Hem standart kart stili hem de aktif border stili */}
            <View style={[styles.counterCard, styles.activeCard]}>
              <View style={styles.counterIcon}>
                <Text style={styles.counterEmoji}>👥</Text>
              </View>
              <Text style={styles.counterLabel}>{t('setup.playerCount')}</Text>

              {/* ... geri kalan butonlar aynı ... */}
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
            {/* Kelime Oyunu */}
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

            {/* Soru Oyunu */}
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📂</Text>
            <Text style={styles.sectionTitle}>{t('setup.categories')}</Text>
          </View>
          <View style={styles.categoryList}>
            {Object.keys(CATEGORIES).map(categoryId => {
              const category = CATEGORIES[categoryId];
              const isSelected = state.selectedCategory === categoryId;
              return (
                <TouchableOpacity
                  key={categoryId}
                  style={[
                    styles.categoryItem,
                    isSelected && styles.categoryItemActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(categoryId)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && styles.categoryNameActive,
                    ]}
                  >
                    {t(`categories.${categoryId}`)}
                  </Text>
                  {isSelected && (
                    <View style={styles.categoryCheck}>
                      <Text style={styles.categoryCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
  placeholder: {
    width: 40,
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
  categoryList: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  categoryIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },
  categoryNameActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  categoryCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryCheckText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '700',
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
  settingsButton: {
    position: 'absolute',
    top: 15,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCard: {
    borderColor: colors.accentPrimary, // Tema rengin (mor)
    borderWidth: 1.5, // Biraz daha belirgin olması için 1.5 veya 2 yapabilirsin
    backgroundColor: 'rgba(139, 92, 246, 0.05)', // (Opsiyonel) Çok hafif bir mor arka plan
    shadowColor: colors.accentPrimary, // (Opsiyonel) Hafif bir parlama efekti
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default GameSetupScreen;
