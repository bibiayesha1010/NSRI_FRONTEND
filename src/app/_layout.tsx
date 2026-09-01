import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider, Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { UIProvider } from '@/context/UIContext';
import { WellnessProvider } from '@/context/WellnessContext';
import { colors } from '@/theme/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WellnessProvider>
        <UIProvider>
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
                title: 'Wellness',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="heart-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="chat"
              options={{
                title: 'Companion',
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
              name="explore"
              options={{
                title: 'Explore',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="compass-outline" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </UIProvider>
      </WellnessProvider>
    </ThemeProvider>
  );
}
