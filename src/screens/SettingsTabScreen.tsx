import { useAuth } from '@/context/AuthContext';
import { useWellness } from '@/context/WellnessContext';
import { applyThemeMode, colors, radius, shadowStyle, spacing, typography } from '@/theme/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const SettingsTabScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { deviceConnected, connectedDeviceType, connectWearable, disconnectWearable } = useWellness();
  const [darkMode, setDarkMode] = useState(false);

  const handleThemeToggle = async (nextValue: boolean) => {
    setDarkMode(nextValue);
    applyThemeMode(nextValue);
    await import('expo-secure-store').then((SecureStore) => {
      SecureStore.setItemAsync('wellness_mind_theme_mode', nextValue ? 'dark' : 'light');
    });
  };
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
        },
        style: 'destructive',
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing is ready for your next update.');
  };

  const handleReminderTime = () => {
    Alert.alert('Daily Reminder', 'Your reminder is set for 8:00 AM.');
  };

  const handleSecurityAction = (title: string) => {
    Alert.alert(title, 'This security setting is enabled for your account.');
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'Your data stays private and is used only for wellness tracking.');
  };

  const handleConnectedDevices = () => {
    if (deviceConnected) {
      Alert.alert(
        'Connected device',
        `Your ${connectedDeviceType.replace('_', ' ')} is already connected.`,
        [
          { text: 'Keep connected', style: 'cancel' },
          { text: 'Disconnect', onPress: disconnectWearable, style: 'destructive' },
        ],
      );
      return;
    }

    Alert.alert(
      'Connect wearable',
      'This app needs permission to read heart rate, HRV, and sleep data from your wearable device.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Allow access',
          onPress: () => connectWearable('smartwatch'),
        },
      ],
    );
  };

  const handleSyncData = () => {
    if (!deviceConnected) {
      handleConnectedDevices();
      return;
    }

    Alert.alert('Sync Data', 'Your wearable data has been synced successfully.');
  };

  const handleAbout = () => {
    Alert.alert('About Wellness Mind', 'Version 1.0.0');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Support options will open here in a future release.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-circle" size={60} color={colors.secondary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
            </View>
            <Pressable style={styles.editButton} onPress={handleEditProfile}>
              <Ionicons name="pencil" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display & Theme</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="contrast-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>Easier on the eyes at night</Text>
              </View>
              <Switch value={darkMode} onValueChange={handleThemeToggle} />
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Daily check-in reminders and wellness tips</Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
            </View>

            <Pressable style={[styles.settingRow, styles.settingRowBordered]} onPress={handleReminderTime}>
              <View style={styles.settingIcon}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Daily Reminder Time</Text>
                <Text style={styles.settingDescription}>8:00 AM</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.low} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Private Journal</Text>
                <Text style={styles.settingDescription}>Only you can access your journal entries</Text>
              </View>
              <Switch value={privacyMode} onValueChange={setPrivacyMode} />
            </View>

            <Pressable style={[styles.settingRow, styles.settingRowBordered]} onPress={() => handleSecurityAction('Two-Factor Auth')}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.low} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Two-Factor Auth</Text>
                <Text style={styles.settingDescription}>Add an extra layer of security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            <Pressable style={[styles.settingRow, styles.settingRowBordered]} onPress={handlePrivacyPolicy}>
              <View style={styles.settingIcon}>
                <Ionicons name="document-text-outline" size={20} color={colors.low} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>Read our privacy terms</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Device Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wearable Devices</Text>

          <View style={styles.settingCard}>
            <Pressable style={styles.settingRow} onPress={handleConnectedDevices}>
              <View style={styles.settingIcon}>
                <Ionicons name="watch-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Connected Devices</Text>
                <Text style={styles.settingDescription}>
                  {deviceConnected ? `Connected: ${connectedDeviceType.replace('_', ' ')}` : 'Manage your smartwatch and fitness bands'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>

            <View style={[styles.settingRow, styles.settingRowBordered]}>
              <View style={styles.settingIcon}>
                <Ionicons name="cloud-done-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Sync Data</Text>
                <Text style={styles.settingDescription}>
                  {deviceConnected ? 'Last synced just now' : 'Permission required to sync'}
                </Text>
              </View>
              <Pressable style={styles.syncButton} onPress={handleSyncData}>
                <Text style={styles.syncButtonText}>{deviceConnected ? 'Sync Now' : 'Connect'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.settingCard}>
            <Pressable style={styles.settingRow} onPress={handleAbout}>
              <View style={styles.settingIcon}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>About Wellness Mind</Text>
                <Text style={styles.settingDescription}>Version 1.0.0</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.settingRow, styles.settingRowBordered]} onPress={handleHelp}>
              <View style={styles.settingIcon}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Help & Support</Text>
                <Text style={styles.settingDescription}>Get help with using the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.textInverse} style={styles.buttonIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={colors.textInverse} style={styles.buttonIcon} />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Your mental health matters.</Text>
          <Text style={styles.footerText}>Use this app as a wellness tool, not a substitute for professional help.</Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
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
  section: {
    marginBottom: spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadowStyle,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '700',
  },
  profileEmail: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  editButton: {
    padding: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  settingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadowStyle,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingRowBordered: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  syncButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    ...shadowStyle,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.low,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    marginTop: spacing.md,
    ...shadowStyle,
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  logoutButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    fontWeight: '700',
  },
  deleteButtonText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  spacer: {
    height: spacing.xl,
  },
});
