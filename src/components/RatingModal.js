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
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';
import { useTranslation } from 'react-i18next';
import { colors, gradients, withAlpha } from '../theme/colors';
import GradientButton from './ui/GradientButton';
import IconTile from './ui/IconTile';
import PressableScale from './ui/PressableScale';

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
        <LinearGradient
          colors={['#2a2152', '#15122b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={styles.modalCard}
        >
          <View style={styles.iconHalo}>
            <IconTile name="star" size={76} gradient={gradients.warning} round />
          </View>
          <Text style={styles.modalTitle}>{t('rating.title')}</Text>
          <Text style={styles.modalSubtitle}>{t('rating.subtitle')}</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => {
              const isActive = selectedRating >= star;
              return (
                <PressableScale
                  key={star}
                  scaleTo={0.8}
                  hitSlop={4}
                  onPress={() => setSelectedRating(star)}
                >
                  <Icon
                    name={isActive ? 'star' : 'star-outline'}
                    size={40}
                    color={isActive ? colors.warning : colors.borderLight}
                  />
                </PressableScale>
              );
            })}
          </View>

          <GradientButton
            title={t('rating.submit')}
            variant="warning"
            size="md"
            disabled={selectedRating === 0}
            onPress={handleSubmit}
            style={styles.modalButton}
          />

          <TouchableOpacity style={styles.laterButton} onPress={handleLater}>
            <Text style={styles.modalLater}>{t('rating.later')}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 12, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: withAlpha(colors.warning, 0.35),
  },
  iconHalo: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: withAlpha(colors.warning, 0.12),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 26,
  },
  modalButton: {
    alignSelf: 'stretch',
  },
  laterButton: {
    paddingTop: 14,
    paddingHorizontal: 12,
  },
  modalLater: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default RatingModal;
