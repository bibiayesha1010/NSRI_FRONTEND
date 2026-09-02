import { colors, radius, shadowStyle, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export const NSRITabScreen: React.FC = () => {
  const [heartRate, setHeartRate] = useState<string>('72');
  const [hrv, setHrv] = useState<string>('45');
  const [sleepHours, setSleepHours] = useState<string>('7.5');
  const [sleepQuality, setSleepQuality] = useState<string>('4');
  const [deviceType, setDeviceType] = useState<'smartwatch' | 'fitness_band' | 'health_monitor' | 'manual'>('manual');
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Calculate NSRI based on device data
  const calculateNSRI = () => {
    const hr = parseFloat(heartRate) || 0;
    const hrvVal = parseFloat(hrv) || 0;
    const sleep = parseFloat(sleepHours) || 0;
    const sleepQual = parseFloat(sleepQuality) || 0;

    let score = 50; // Base score

    // Heart rate scoring (60-100 is optimal)
    if (hr >= 60 && hr <= 100) {
      score += 15;
    } else if (hr > 100) {
      score -= 10; // High HR = more stress
    }

    // HRV scoring (higher HRV = better nervous system regulation)
    if (hrvVal >= 40) {
      score += 20;
    } else if (hrvVal >= 20) {
      score += 10;
    } else {
      score -= 5;
    }

    // Sleep scoring (7-9 hours optimal)
    if (sleep >= 7 && sleep <= 9) {
      score += 20;
    } else if (sleep >= 6 && sleep < 7) {
      score += 10;
    } else if (sleep < 6) {
      score -= 15;
    }

    // Sleep quality scoring
    if (sleepQual >= 4) {
      score += 15;
    } else if (sleepQual >= 3) {
      score += 5;
    } else {
      score -= 5;
    }

    return Math.min(Math.max(score, 0), 100);
  };

  const nsriScore = calculateNSRI();
  const getNSRIStatus = () => {
    if (nsriScore >= 80) return { label: 'Excellent', color: colors.exercise };
    if (nsriScore >= 65) return { label: 'Good', color: colors.primary };
    if (nsriScore >= 50) return { label: 'Moderate', color: colors.accent };
    if (nsriScore >= 35) return { label: 'Fair', color: colors.attention };
    return { label: 'Low', color: colors.low };
  };

  const status = getNSRIStatus();

  const getHRVInterpretation = () => {
    const hrvVal = parseFloat(hrv) || 0;
    if (hrvVal >= 50) return 'Excellent parasympathetic tone (relaxed)';
    if (hrvVal >= 30) return 'Good nervous system balance';
    if (hrvVal >= 20) return 'Moderate - some stress present';
    return 'Low - elevated sympathetic activation (stressed)';
  };

  const getHeartRateInterpretation = () => {
    const hrVal = parseFloat(heartRate) || 0;
    if (hrVal < 60) return 'Low resting HR - excellent cardiovascular fitness';
    if (hrVal <= 100) return 'Normal resting heart rate';
    if (hrVal <= 120) return 'Elevated - may indicate stress or activity';
    return 'High - check if you\'re at rest or under stress';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Main NSRI Score Display */}
        <View style={[styles.scoreCard, { borderLeftColor: status.color }]}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Nervous System Status</Text>
            <Ionicons name="pulse" size={28} color={status.color} />
          </View>

          <View style={styles.scoreDisplay}>
            <View style={[styles.scoreCircle, { borderColor: status.color }]}>
              <Text style={[styles.scoreNumber, { color: status.color }]}>{Math.round(nsriScore)}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>

            <View style={styles.scoreInfo}>
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
              <Text style={styles.statusInterpretation}>
                {nsriScore >= 80
                  ? 'Your nervous system is well-regulated'
                  : nsriScore >= 65
                  ? 'Your nervous system is balanced'
                  : nsriScore >= 50
                  ? 'Moderate nervous system activity'
                  : nsriScore >= 35
                  ? 'Elevated nervous system stress'
                  : 'Your nervous system is significantly activated - focus on relaxation'}
              </Text>
            </View>
          </View>

          <View style={styles.exhaustionIndicator}>
            <Text style={styles.exhaustionLabel}>Nervous System Exhaustion Level:</Text>
            <View style={styles.exhaustionBar}>
              <View style={[styles.exhaustionFill, { width: `${100 - nsriScore}%`, backgroundColor: colors.low }]} />
            </View>
            <Text style={styles.exhaustionPercent}>{Math.round(100 - nsriScore)}%</Text>
          </View>
        </View>

        {/* Device Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Source</Text>
          <Pressable
            style={styles.deviceButton}
            onPress={() => setShowDeviceModal(true)}
          >
            <Ionicons name="watch-outline" size={20} color={colors.primary} />
            <View style={styles.deviceButtonText}>
              <Text style={styles.deviceButtonLabel}>Connected Device</Text>
              <Text style={styles.deviceButtonValue}>{deviceType.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wearable Data Input</Text>

          {/* Heart Rate */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Heart Rate (Resting)</Text>
              <View style={styles.badge}>
                <Ionicons name="heart" size={14} color={colors.low} />
                <Text style={styles.badgeText}>bpm</Text>
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.numberInput}
                placeholder="72"
                placeholderTextColor={colors.textMuted}
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.interpretation}>{getHeartRateInterpretation()}</Text>
          </View>

          {/* HRV */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Heart Rate Variability (HRV)</Text>
              <View style={styles.badge}>
                <Ionicons name="pulse" size={14} color={colors.primary} />
                <Text style={styles.badgeText}>ms</Text>
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.numberInput}
                placeholder="45"
                placeholderTextColor={colors.textMuted}
                value={hrv}
                onChangeText={setHrv}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.interpretation}>{getHRVInterpretation()}</Text>
            <Text style={styles.hint}>💡 Higher HRV = Better nervous system regulation</Text>
          </View>

          {/* Sleep Hours */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Sleep Duration</Text>
              <View style={styles.badge}>
                <Ionicons name="moon" size={14} color={colors.accent} />
                <Text style={styles.badgeText}>hours</Text>
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.numberInput}
                placeholder="7.5"
                placeholderTextColor={colors.textMuted}
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.interpretation}>
              {parseFloat(sleepHours) >= 7 && parseFloat(sleepHours) <= 9
                ? 'Optimal sleep duration'
                : 'Aim for 7-9 hours for best nervous system recovery'}
            </Text>
          </View>

          {/* Sleep Quality */}
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>Sleep Quality</Text>
              <View style={styles.badge}>
                <Ionicons name="star" size={14} color={colors.accent} />
                <Text style={styles.badgeText}>/5</Text>
              </View>
            </View>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Pressable
                  key={rating}
                  style={[
                    styles.ratingButton,
                    sleepQuality === String(rating) && styles.ratingButtonActive,
                  ]}
                  onPress={() => setSleepQuality(String(rating))}
                >
                  <Text
                    style={[
                      styles.ratingButtonText,
                      sleepQuality === String(rating) && styles.ratingButtonTextActive,
                    ]}
                  >
                    {rating}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Interpretation Section */}
        <View style={styles.interpretationCard}>
          <View style={styles.interpretationHeader}>
            <Ionicons name="bulb-outline" size={20} color={colors.accent} />
            <Text style={styles.interpretationTitle}>What This Means</Text>
          </View>
          <Text style={styles.interpretationText}>
            Your NSRI score reflects how much your nervous system is activated or exhausted. A higher score indicates better regulation and less exhaustion.
          </Text>
          <Text style={[styles.interpretationText, { marginTop: spacing.md }]}>
            Factors contributing to your score:
          </Text>
          <View style={styles.factorsList}>
            <Text style={styles.factorItem}>• Heart Rate: {getHeartRateInterpretation()}</Text>
            <Text style={styles.factorItem}>• HRV: {getHRVInterpretation()}</Text>
            <Text style={styles.factorItem}>• Sleep: {sleepHours} hours logged</Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Device Type Modal */}
      <Modal visible={showDeviceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Device Type</Text>
              <Pressable onPress={() => setShowDeviceModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.deviceOptions}>
              {(['smartwatch', 'fitness_band', 'health_monitor', 'manual'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={[styles.deviceOption, deviceType === type && styles.deviceOptionActive]}
                  onPress={() => {
                    setDeviceType(type);
                    setShowDeviceModal(false);
                  }}
                >
                  <Ionicons
                    name={
                      type === 'smartwatch'
                        ? 'watch-outline'
                        : type === 'fitness_band'
                        ? 'fitness-outline'
                        : type === 'health_monitor'
                        ? 'pulse-outline'
                        : 'add-circle-outline'
                    }
                    size={24}
                    color={deviceType === type ? colors.secondary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.deviceOptionText,
                      deviceType === type && styles.deviceOptionTextActive,
                    ]}
                  >
                    {type === 'smartwatch'
                      ? 'Smartwatch'
                      : type === 'fitness_band'
                      ? 'Fitness Band'
                      : type === 'health_monitor'
                      ? 'Health Monitor'
                      : 'Manual Entry'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scoreCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadowStyle,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    ...typography.h2,
    color: colors.text,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
  },
  scoreNumber: {
    ...typography.h1,
    fontWeight: '700',
  },
  scoreMax: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scoreInfo: {
    flex: 1,
  },
  statusLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusInterpretation: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 20,
  },
  exhaustionIndicator: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exhaustionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  exhaustionBar: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  exhaustionFill: {
    height: '100%',
    backgroundColor: colors.low,
  },
  exhaustionPercent: {
    ...typography.caption,
    color: colors.low,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  deviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deviceButtonText: {
    flex: 1,
  },
  deviceButtonLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  deviceButtonValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inputLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
    color: colors.textMuted,
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  numberInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.h2,
    color: colors.text,
  },
  interpretation: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  ratingButtonText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '700',
  },
  ratingButtonTextActive: {
    color: colors.textInverse,
  },
  interpretationCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  interpretationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  interpretationTitle: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  interpretationText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  factorsList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  factorItem: {
    ...typography.body,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  deviceOptions: {
    gap: spacing.md,
  },
  deviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  deviceOptionActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondarySoft,
  },
  deviceOptionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  deviceOptionTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  spacer: {
    height: spacing.xl,
  },
});
