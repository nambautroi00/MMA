import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';
import { useApp } from '@/context/app-context';
import { ActivityLog } from '@/hooks/use-tasks';

export default function SettingsScreen() {
  const { settings, toggleDarkMode, toggleFluidAnimations, stats, activityLog } = useApp();
  const isDark = settings.darkMode;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? '#0A100D' : '#F4F8F6' }]}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <Image source={require('@/assets/images/user.jpg')} style={[styles.profileAvatar, { borderColor: isDark ? '#1A2520' : '#D3E7DB' }]} />
          <View style={styles.profileText}>
            <Text style={[styles.name, { color: isDark ? '#EBF1EE' : '#26302B' }]}>Nam</Text>
            <Text style={[styles.role, { color: isDark ? '#8F9D97' : '#5C6F65' }]}>Creative Lead · {stats.totalTasks} tasks</Text>
          </View>
        </View>

        <Label text="Appearance" isDark={isDark} />
        <View style={[styles.group, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <SettingRow
            icon={isDark ? 'dark-mode' : 'light-mode'}
            label="Dark Mode"
            right={<Toggle active={isDark} onPress={toggleDarkMode} />}
          />
          <SettingRow
            icon="blur-on"
            label="Animations"
            right={<Toggle active={settings.fluidAnimations} onPress={toggleFluidAnimations} />}
          />
        </View>

        <Label text="About" isDark={isDark} />
        <View style={[styles.group, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <SettingRow icon="info-outline" label="Version" value="2.4.0" />
          <SettingRow icon="person-outline" label="Developer" value="Nam" />
        </View>

        <View style={styles.activityHeader}>
          <Text style={[styles.recentTitle, { color: isDark ? '#EBF1EE' : '#0B1712' }]}>Activity Log</Text>
        </View>

        <View style={styles.activityList}>
          {activityLog.length === 0 ? (
            <View style={[styles.activityCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
              <Text style={[styles.activityTitle, { color: isDark ? '#8F9D97' : '#5A6761' }]}>No activity yet</Text>
            </View>
          ) : (
            activityLog.slice(0, 5).map((log) => {
              const details = getActivityDetails(log, isDark);
              return (
                <View key={log.id} style={[styles.activityCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
                  <View style={[styles.activityIcon, { backgroundColor: details.bg }]}>
                    <MaterialIcons
                      name={details.icon as keyof typeof MaterialIcons.glyphMap}
                      size={16}
                      color={details.color}
                    />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, { color: isDark ? '#EBF1EE' : '#43524B' }]} numberOfLines={1}>{details.title}</Text>
                    <Text style={[styles.activityTime, { color: isDark ? '#8F9D97' : '#778A80' }]}>{getRelativeTime(log.timestamp)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#5A6C62' : '#8A9991' }]}>Assignment 1 - Task Management App</Text>
          <Text style={[styles.footerSub, { color: isDark ? '#4D5D54' : '#A0ADA6' }]}>Built with React Native + Expo Router</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text, isDark }: { text: string; isDark: boolean }) {
  return <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#8C9E95' }]}>{text}</Text>;
}

function SettingRow({
  icon,
  label,
  value,
  chevron,
  right,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  chevron?: boolean;
  right?: ReactNode;
}) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  return (
    <View style={[styles.row, { borderBottomColor: isDark ? '#1D2823' : '#F0F5F2' }]}>
      <View style={styles.rowLeft}>
        <MaterialIcons name={icon} size={18} color={isDark ? '#8F9D97' : '#6D8D7D'} />
        <Text style={[styles.rowLabel, { color: isDark ? '#EBF1EE' : '#43524B' }]}>{label}</Text>
      </View>
      {value ? <Text style={[styles.rowValue, { color: isDark ? '#8F9D97' : '#50635A' }]}>{value}</Text> : null}
      {right}
      {chevron ? <MaterialIcons name="chevron-right" size={20} color={isDark ? '#5A6C63' : '#789086'} /> : null}
    </View>
  );
}

function Toggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  return (
    <Pressable
      style={[
        styles.toggle,
        { backgroundColor: active ? (isDark ? '#10B981' : '#5F806D') : (isDark ? '#2C3E36' : '#DDE9E2') }
      ]}
      onPress={onPress}
    >
      <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
    </Pressable>
  );
}

function getActivityDetails(log: ActivityLog, isDark: boolean) {
  switch (log.type) {
    case 'CREATE':
      return {
        title: `Created "${log.taskTitle}"`,
        icon: 'add-circle-outline',
        color: '#3B82F6',
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
      };
    case 'UPDATE':
      return {
        title: `Updated "${log.taskTitle}"`,
        icon: 'edit',
        color: '#F59E0B',
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      };
    case 'COMPLETE':
      return {
        title: `Completed "${log.taskTitle}"`,
        icon: 'check-circle-outline',
        color: '#10B981',
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      };
    case 'DELETE':
      return {
        title: `Deleted "${log.taskTitle}"`,
        icon: 'delete-outline',
        color: '#EF4444',
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      };
    default:
      return {
        title: `Action on "${log.taskTitle}"`,
        icon: 'info-outline',
        color: '#8A9BA8',
        bg: isDark ? 'rgba(138, 155, 168, 0.15)' : 'rgba(138, 155, 168, 0.08)',
      };
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingTop: 84,
    paddingBottom: 104,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    padding: 17,
  },
  profileAvatar: {
    borderRadius: 31,
    borderWidth: 3,
    height: 62,
    width: 62,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
  },
  role: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 13,
    maxWidth: 140,
    textAlign: 'right',
    fontWeight: '700',
  },
  toggle: {
    alignItems: 'flex-start',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 42,
  },
  toggleKnob: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  activityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  activityList: {
    gap: 9,
    marginTop: 10,
  },
  activityCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    padding: 13,
  },
  activityIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activityTime: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 11,
    marginTop: 3,
  },
});