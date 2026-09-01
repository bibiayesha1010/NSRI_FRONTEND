import { colors, radius, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const PHASES = [
  { label: 'Breathe in', seconds: 4, scale: 1.4 },
  { label: 'Hold', seconds: 4, scale: 1.4 },
  { label: 'Breathe out', seconds: 6, scale: 1 },
];

interface BreathingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BreathingModal: React.FC<BreathingModalProps> = ({ visible, onClose }) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      setPhaseIndex(0);
      scaleAnim.setValue(1);
      return;
    }

    let cancelled = false;
    let index = 0;

    const runPhase = () => {
      if (cancelled) return;
      const phase = PHASES[index % PHASES.length];
      setPhaseIndex(index % PHASES.length);
      Animated.timing(scaleAnim, {
        toValue: phase.scale,
        duration: phase.seconds * 1000,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        if (!cancelled) {
          index += 1;
          runPhase();
        }
      }, phase.seconds * 1000);
    };

    runPhase();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  const phase = PHASES[phaseIndex];

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Pressable style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </Pressable>

          <Text style={styles.title}>Breathing Reset</Text>
          <Text style={styles.subtitle}>Follow the circle. In for 4, hold for 4, out for 6.</Text>

          <View style={styles.circleWrap}>
            <Animated.View style={[styles.circle, { transform: [{ scale: scaleAnim }] }]} />
            <Text style={styles.phaseLabel}>{phase.label}</Text>
          </View>

          <Pressable style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>I'm done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(58,56,51,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  circleWrap: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondarySoft,
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  phaseLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  doneButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
});