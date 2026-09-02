import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UIProvider } from '@/context/UIContext';
import { WellnessProvider } from '@/context/WellnessContext';
import { LoginScreen } from '@/screens/LoginScreen';
import { SignupScreen } from '@/screens/SignupScreen';
import { applyThemeMode, colors } from '@/theme/theme';

type AuthScreens = 'login' | 'signup';

function AuthNavigator() {
  const [authScreen, setAuthScreen] = useState<AuthScreens>('login');

  return authScreen === 'login' ? (
    <LoginScreen onSignupPress={() => setAuthScreen('signup')} />
  ) : (
    <SignupScreen onLoginPress={() => setAuthScreen('login')} />
  );
}

function AppTabs() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wellness"
          options={{
            title: 'Wellness',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'sparkles' : 'sparkles-outline'}
                size={size + 2}
                color={focused ? colors.secondary : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="nsri"
          options={{
            title: 'NSRI',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pulse" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

function RootContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Show splash screen here if needed
  }

  return isAuthenticated ? <AppTabs /> : <AuthNavigator />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const restoreTheme = async () => {
      const storedMode = await SecureStore.getItemAsync('wellness_mind_theme_mode');
      const shouldUseDark = storedMode ? storedMode === 'dark' : colorScheme === 'dark';
      applyThemeMode(shouldUseDark);
    };

    restoreTheme();
  }, [colorScheme]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <WellnessProvider>
          <UIProvider>
            <RootContent />
          </UIProvider>
        </WellnessProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
