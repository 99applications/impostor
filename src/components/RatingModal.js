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
import { colors } from '../theme/colors';

export const HAS_RATED_KEY = '@has_rated';

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

  const handleLater = () => {
    setSelectedRating(0);
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
          <Text style={styles.modalTitle}>Nasıl buldun?</Text>
          <Text style={styles.modalSubtitle}>
            Oyunu beğendiysen bize destek ol!
          </Text>

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
            <Text style={styles.modalButtonText}>Gönder</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLater}>
            <Text style={styles.modalLater}>Daha Sonra</Text>
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
