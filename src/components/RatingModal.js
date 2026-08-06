import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export const HAS_RATED_KEY = '@has_rated';
export const RATING_LATER_KEY = '@rating_later_at';
export const GAMES_PLAYED_KEY = '@games_played';

const RATING_LATER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MIN_GAMES_BEFORE_RATING = 3;

/** Session guard so Home + GameEnd don't both show rating. */
let ratingShownThisSession = false;

export const incrementGamesPlayed = async () => {
  try {
    const raw = await AsyncStorage.getItem(GAMES_PLAYED_KEY);
    const count = (parseInt(raw, 10) || 0) + 1;
    await AsyncStorage.setItem(GAMES_PLAYED_KEY, String(count));
    return count;
  } catch (e) {
    return 0;
  }
};

export const shouldShowRatingPrompt = async ({ requireMinGames = true } = {}) => {
  if (ratingShownThisSession) return false;

  try {
    const hasRated = await AsyncStorage.getItem(HAS_RATED_KEY);
    if (hasRated) return false;

    const laterAt = await AsyncStorage.getItem(RATING_LATER_KEY);
    if (laterAt) {
      const elapsed = Date.now() - parseInt(laterAt, 10);
      if (elapsed < RATING_LATER_COOLDOWN_MS) return false;
    }

    if (requireMinGames) {
      const raw = await AsyncStorage.getItem(GAMES_PLAYED_KEY);
      const gamesPlayed = parseInt(raw, 10) || 0;
      if (gamesPlayed < MIN_GAMES_BEFORE_RATING) return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

export const markRatingPromptShown = () => {
  ratingShownThisSession = true;
};

const ANDROID_PACKAGE = 'com.impostor';
const IOS_APP_ID = 'XXXXXXXXX'; // App Store ID eklendiğinde buraya yaz

const openStoreReview = async () => {
  let primaryUrl;
  let webUrl;

  if (Platform.OS === 'ios') {
    primaryUrl = `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}?action=write-review`;
    webUrl = `https://apps.apple.com/app/id${IOS_APP_ID}`;
  } else {
    primaryUrl = `market://details?id=${ANDROID_PACKAGE}`;
    webUrl = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
  }

  try {
    await Linking.openURL(primaryUrl);
  } catch (e) {
    try {
      await Linking.openURL(webUrl);
    } catch (e2) {
      console.log('Store URL error:', e2);
    }
  }
};

const RatingModal = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [selectedRating, setSelectedRating] = useState(0);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;

    const rating = selectedRating;
    setSelectedRating(0);

    try {
      await AsyncStorage.setItem(HAS_RATED_KEY, 'true');
    } catch (e) {}

    onClose();

    if (rating >= 4) {
      // Önce in-app review dene (daha iyi UX)
      let inAppShown = false;
      try {
        if (InAppReview.isAvailable()) {
          const result = await InAppReview.RequestInAppReview();
          inAppShown = !!result;
        }
      } catch (e) {
        inAppShown = false;
      }

      // In-app review çalışmadıysa Play Store'u aç (güvenilir yedek)
      if (!inAppShown) {
        await openStoreReview();
      }
    }
  };

  const handleLater = async () => {
    setSelectedRating(0);
    try {
      await AsyncStorage.setItem(RATING_LATER_KEY, String(Date.now()));
    } catch (e) {}
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleLater}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Icon
            name="star"
            size={48}
            color={colors.warning}
            style={styles.modalIcon}
          />
          <Text style={styles.modalTitle}>{t('rating.title')}</Text>
          <Text style={styles.modalSubtitle}>{t('rating.subtitle')}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setSelectedRating(star)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.star,
                    selectedRating >= star && styles.starActive,
                  ]}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.modalButton,
              selectedRating === 0 && styles.modalButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={selectedRating === 0}
          >
            <Text style={styles.modalButtonText}>{t('rating.submit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLater}>
            <Text style={styles.modalLater}>{t('rating.later')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalIcon: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  star: {
    fontSize: 44,
    color: colors.border,
  },
  starActive: {
    color: '#F59E0B',
  },
  modalButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalLater: {
    fontSize: 14,
    color: colors.textMuted,
  },
});

export default RatingModal;
