import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useGame } from '../context/GameContext';
import { usePremium } from '../context/PremiumContext';

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

const CustomCategoryScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    state,
    addCustomCategory,
    updateCustomCategory,
    deleteCustomCategory,
  } = useGame();
  const { isPremium } = usePremium();

  const editingCategory = route.params?.category;
  const isEditing = !!editingCategory;

  const [name, setName] = useState(editingCategory?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(
    editingCategory?.icon || 'folder',
  );
  const [words, setWords] = useState(editingCategory?.words?.join('\n') || '');
  const [showIconPicker, setShowIconPicker] = useState(false);

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

    if (wordList.length < 5) {
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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('customCategory.title')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.premiumRequired}>
          <View style={styles.premiumIcon}>
            <Icon name="lock-closed" size={48} color={colors.warning} />
          </View>
          <Text style={styles.premiumTitle}>
            {t('customCategory.premiumRequired')}
          </Text>
          <Text style={styles.premiumDesc}>
            {t('customCategory.premiumDesc')}
          </Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => navigation.navigate('Premium')}
          >
            <Icon name="diamond" size={20} color={colors.textPrimary} />
            <Text style={styles.premiumButtonText}>
              {t('customCategory.getPremium')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing
            ? t('customCategory.editTitle')
            : t('customCategory.title')}
        </Text>
        {isEditing ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Icon name="trash-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kategori Adı */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('customCategory.name')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('customCategory.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={30}
          />
        </View>

        {/* İkon Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('customCategory.icon')}</Text>
          <TouchableOpacity
            style={styles.iconSelector}
            onPress={() => setShowIconPicker(!showIconPicker)}
          >
            <View style={styles.selectedIconWrapper}>
              <Icon
                name={selectedIcon}
                size={28}
                color={colors.accentPrimary}
              />
            </View>
            <Text style={styles.iconSelectorText}>
              {t('customCategory.selectIcon')}
            </Text>
            <Icon
              name={showIconPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {showIconPicker && (
            <View style={styles.iconGrid}>
              {ICONS.map(iconName => (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconItem,
                    selectedIcon === iconName && styles.iconItemActive,
                  ]}
                  onPress={() => {
                    setSelectedIcon(iconName);
                    setShowIconPicker(false);
                  }}
                >
                  <Icon
                    name={iconName}
                    size={24}
                    color={
                      selectedIcon === iconName
                        ? colors.accentPrimary
                        : colors.textSecondary
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Kelimeler */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>{t('customCategory.words')}</Text>
            <Text style={styles.wordCount}>
              {words.split('\n').filter(w => w.trim()).length}{' '}
              {t('customCategory.wordsCount')}
            </Text>
          </View>
          <Text style={styles.sectionHint}>
            {t('customCategory.wordsHint')}
          </Text>
          <TextInput
            style={styles.textArea}
            value={words}
            onChangeText={setWords}
            placeholder={t('customCategory.wordsPlaceholder')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </View>

        {/* Önizleme */}
        {name.trim() && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>
              {t('customCategory.preview')}
            </Text>
            <View style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <Icon
                  name={selectedIcon}
                  size={28}
                  color={colors.textPrimary}
                />
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{name}</Text>
                <Text style={styles.previewCount}>
                  {words.split('\n').filter(w => w.trim()).length}{' '}
                  {t('categorySelect.words')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Kaydet Butonu */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!name.trim() ||
              words.split('\n').filter(w => w.trim()).length < 5) &&
              styles.saveButtonDisabled,
          ]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={
            !name.trim() || words.split('\n').filter(w => w.trim()).length < 5
          }
        >
          <Icon name="checkmark" size={22} color={colors.textPrimary} />
          <Text style={styles.saveButtonText}>
            {isEditing ? t('customCategory.update') : t('customCategory.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  placeholder: {
    width: 40,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  wordCount: {
    fontSize: 14,
    color: colors.accentPrimary,
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSelectorText: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  iconItem: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.bgCardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconItemActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  textArea: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  previewIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  previewCount: {
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  saveButtonDisabled: {
    backgroundColor: colors.bgCardLight,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Premium Required
  premiumRequired: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  premiumIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumDesc: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
  },
  premiumButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default CustomCategoryScreen;
