import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, gradients, withAlpha } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';
import {
  GlassCard,
  GradientButton,
  IconButton,
  IconTile,
  PressableScale,
  ScreenBackground,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';

const ICONS = [
  'home',
  'business',
  'school',
  'people',
  'heart',
  'star',
  'football',
  'musical-notes',
  'film',
  'car',
  'airplane',
  'boat',
  'pizza',
  'cafe',
  'beer',
  'wine',
  'fish',
  'leaf',
  'paw',
  'bug',
  'flower',
  'planet',
  'moon',
  'sunny',
  'game-controller',
  'trophy',
  'medal',
  'ribbon',
  'gift',
  'balloon',
];

const MIN_WORDS = 5;

const CustomCategoryScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addCustomCategory, updateCustomCategory, deleteCustomCategory } =
    useGame();
  const { isPremium } = usePremium();

  const editingCategory = route.params?.category;
  const isEditing = !!editingCategory;

  const [name, setName] = useState(editingCategory?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(
    editingCategory?.icon || 'folder',
  );
  const [words, setWords] = useState(editingCategory?.words?.join('\n') || '');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const wordCount = words.split('\n').filter(w => w.trim()).length;
  const canSave = !!name.trim() && wordCount >= MIN_WORDS;

  const handleSave = async () => {
    // Validasyon
    const trimmedName = name.trim();
    const wordList = words
      .split('\n')
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (!trimmedName) {
      Alert.alert(t('customCategory.error'), t('customCategory.nameRequired'));
      return;
    }

    if (wordList.length < MIN_WORDS) {
      Alert.alert(t('customCategory.error'), t('customCategory.minWords'));
      return;
    }

    const categoryId = isEditing ? editingCategory.id : `custom_${Date.now()}`;

    const category = {
      id: categoryId,
      name: trimmedName,
      icon: selectedIcon,
      words: wordList,
      questions: [], // Şimdilik boş
      hints: [],
      isCustom: true,
      isPremium: false,
      createdAt: isEditing
        ? editingCategory.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      if (isEditing) {
        await updateCustomCategory(category);
      } else {
        await addCustomCategory(category);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('customCategory.error'), t('customCategory.saveFailed'));
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('customCategory.deleteTitle'),
      t('customCategory.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteCustomCategory(editingCategory.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  // Premium değilse erişimi engelle
  if (!isPremium) {
    return (
      <ScreenBackground glow="warning">
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <ScreenHeader
            title={t('customCategory.title')}
            onBack={() => navigation.goBack()}
          />

          <View style={styles.premiumRequired}>
            <View style={styles.premiumHalo}>
              <IconTile
                name="lock-closed"
                size={96}
                iconSize={46}
                gradient={gradients.warning}
                round
              />
            </View>
            <Text style={styles.premiumTitle}>
              {t('customCategory.premiumRequired')}
            </Text>
            <Text style={styles.premiumDesc}>
              {t('customCategory.premiumDesc')}
            </Text>
            <GradientButton
              title={t('customCategory.getPremium')}
              icon="diamond"
              variant="warning"
              style={styles.premiumButton}
              onPress={() =>
                navigation.navigate('Paywall', { onboarding: false })
              }
            />
          </View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader
          title={
            isEditing ? t('customCategory.editTitle') : t('customCategory.title')
          }
          onBack={() => navigation.goBack()}
          right={
            isEditing ? (
              <IconButton
                name="trash-outline"
                variant="danger"
                iconSize={20}
                onPress={handleDelete}
              />
            ) : null
          }
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Önizleme */}
          <GlassCard active style={styles.previewCard}>
            <IconTile name={selectedIcon} size={56} gradient={gradients.brand} />
            <View style={styles.previewInfo}>
              <Text
                style={[styles.previewName, !name.trim() && styles.previewEmpty]}
                numberOfLines={1}
              >
                {name.trim() || t('customCategory.namePlaceholder')}
              </Text>
              <Text style={styles.previewCount}>
                {wordCount} {t('categorySelect.words')}
              </Text>
            </View>
            <Text style={styles.previewTag}>{t('customCategory.preview')}</Text>
          </GlassCard>

          {/* Kategori Adı */}
          <SectionLabel icon="pricetag" title={t('customCategory.name')} />
          <TextInput
            style={[styles.input, focusedField === 'name' && styles.inputFocused]}
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholder={t('customCategory.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={30}
          />

          {/* İkon Seçimi */}
          <SectionLabel
            icon="shapes"
            title={t('customCategory.icon')}
            style={styles.sectionSpacing}
          />
          <GlassCard
            style={styles.iconSelector}
            onPress={() => setShowIconPicker(!showIconPicker)}
          >
            <IconTile name={selectedIcon} size={40} gradient={gradients.primary} soft />
            <Text style={styles.iconSelectorText}>
              {t('customCategory.selectIcon')}
            </Text>
            <Icon
              name={showIconPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </GlassCard>

          {showIconPicker && (
            <GlassCard style={styles.iconGrid}>
              {ICONS.map(iconName => {
                const isActive = selectedIcon === iconName;
                return (
                  <PressableScale
                    key={iconName}
                    style={[styles.iconItem, isActive && styles.iconItemActive]}
                    onPress={() => {
                      setSelectedIcon(iconName);
                      setShowIconPicker(false);
                    }}
                  >
                    <Icon
                      name={iconName}
                      size={22}
                      color={isActive ? colors.textPrimary : colors.textSecondary}
                    />
                  </PressableScale>
                );
              })}
            </GlassCard>
          )}

          {/* Kelimeler */}
          <SectionLabel
            icon="list"
            title={t('customCategory.words')}
            style={styles.sectionSpacing}
            right={
              <View
                style={[
                  styles.wordCountPill,
                  wordCount >= MIN_WORDS && styles.wordCountPillReady,
                ]}
              >
                <Icon
                  name={wordCount >= MIN_WORDS ? 'checkmark-circle' : 'ellipse-outline'}
                  size={12}
                  color={wordCount >= MIN_WORDS ? colors.success : colors.textMuted}
                />
                <Text
                  style={[
                    styles.wordCount,
                    wordCount >= MIN_WORDS && styles.wordCountReady,
                  ]}
                >
                  {wordCount} {t('customCategory.wordsCount')}
                </Text>
              </View>
            }
          />
          <Text style={styles.sectionHint}>{t('customCategory.wordsHint')}</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              focusedField === 'words' && styles.inputFocused,
            ]}
            value={words}
            onChangeText={setWords}
            onFocus={() => setFocusedField('words')}
            onBlur={() => setFocusedField(null)}
            placeholder={t('customCategory.wordsPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Kaydet Butonu */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <GradientButton
            title={isEditing ? t('customCategory.update') : t('customCategory.save')}
            icon="checkmark"
            disabled={!canSave}
            onPress={handleSave}
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 20,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
    marginBottom: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  previewEmpty: {
    color: colors.textMuted,
  },
  previewCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  previewTag: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accentSecondary,
    alignSelf: 'flex-start',
  },
  sectionSpacing: {
    marginTop: 24,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(30, 26, 58, 0.72)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputFocused: {
    borderColor: colors.accentPrimary,
    backgroundColor: withAlpha(colors.accentPrimary, 0.1),
  },
  textArea: {
    minHeight: 200,
    lineHeight: 22,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconSelectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    marginTop: 10,
    gap: 8,
    justifyContent: 'center',
  },
  iconItem: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconItemActive: {
    backgroundColor: colors.accentPrimary,
  },
  wordCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  wordCountPillReady: {
    backgroundColor: withAlpha(colors.success, 0.14),
  },
  wordCount: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  wordCountReady: {
    color: colors.success,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  // Premium Required
  premiumRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  premiumHalo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: withAlpha(colors.warning, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 23,
  },
  premiumButton: {
    alignSelf: 'stretch',
  },
});

export default CustomCategoryScreen;
