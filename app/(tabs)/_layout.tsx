import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '@/context/app-context';
import { FocusTimerModal } from '@/components/focus-timer-modal';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <LiquidTabBar {...props} />}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
      </Tabs>
      <FocusTimerModal />
    </View>
  );
}

const tabMeta: Record<
  string,
  {
    icon: keyof typeof MaterialIcons.glyphMap;
    label: string;
  }
> = {
  index: { icon: 'home', label: 'Home' },
  tasks: { icon: 'checklist', label: 'Tasks' },
  stats: { icon: 'insert-chart-outlined', label: 'Stats' },
  settings: { icon: 'settings', label: 'Settings' },
};

function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { settings, t } = useApp();
  const isDark = settings.darkMode;

  return (
    <View style={[
      styles.tabBarShell,
      {
        backgroundColor: isDark ? 'rgba(18, 28, 24, 0.92)' : 'rgba(255, 255, 255, 0.88)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.8)',
      }
    ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const meta = tabMeta[route.name];
        const { options } = descriptors[route.key];

        if (!meta) {
          return null;
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={({ pressed }) => [
              styles.tabButton,
              pressed && styles.tabButtonPressed,
            ]}>
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <MaterialIcons
                name={meta.icon}
                size={18}
                color={focused ? '#EFFBF3' : '#6F8178'}
              />
              <Text style={[styles.iconLabel, focused && styles.iconLabelActive]}>
                {route.name === 'index' ? t('home') : t(route.name as any)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderColor: 'rgba(255, 255, 255, 0.86)',
    borderRadius: 30,
    borderWidth: 1,
    bottom: 14,
    elevation: 14,
    flexDirection: 'row',
    height: 62,
    left: 18,
    paddingHorizontal: 7,
    position: 'absolute',
    right: 18,
    shadowColor: '#647D70',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 22,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    height: 62,
    justifyContent: 'center',
  },
  tabButtonPressed: {
    opacity: 0.8,
  },
  iconWrap: {
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 2,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 70,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(86, 122, 101, 0.86)',
    borderColor: 'rgba(255, 255, 255, 0.54)',
    shadowColor: '#335642',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
  },
  iconLabel: {
    color: '#6F8178',
    fontSize: 9,
    fontWeight: '800',
  },
  iconLabelActive: {
    color: '#FFFFFF',
  },
});
