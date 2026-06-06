import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';

const activities = [
  { title: "Task 'Math Final' Completed", time: '2 hours ago', icon: 'checklist' },
  { title: 'Updated Work Hours', time: 'Yesterday at 5:30 PM', icon: 'notifications' },
  { title: "Shared 'Design System' Board", time: 'Oct 24, 2023', icon: 'groups' },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Image source={require('@/assets/images/icon.png')} style={styles.profileAvatar} />
          <View style={styles.profileText}>
            <Text style={styles.name}>Alex Designer</Text>
            <Text style={styles.role}>Creative Lead - Pro Plan</Text>
          </View>
        </View>

        <Label text="Appearance" />
        <View style={styles.group}>
          <SettingRow icon="dark-mode" label="Dark Mode" right={<Toggle />} />
          <SettingRow icon="radio-button-unchecked" label="Fluid Animations" chevron />
        </View>

        <Label text="Productivity" />
        <View style={styles.group}>
          <SettingRow icon="schedule" label="Work Hours" value="9:00 AM - 6:00 PM" />
          <SettingRow icon="account-tree" label="Task Categories" chevron />
        </View>

        <Label text="About" />
        <View style={styles.group}>
          <SettingRow icon="info-outline" label="Version 2.4.0" right={<Badge />} />
        </View>

        <View style={styles.activityHeader}>
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.activityList}>
          {activities.map((item) => (
            <View key={item.title} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <MaterialIcons
                  name={item.icon as keyof typeof MaterialIcons.glyphMap}
                  size={16}
                  color="#7F9E8E"
                />
              </View>
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
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
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <MaterialIcons name={icon} size={18} color="#6D8D7D" />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right}
      {chevron ? <MaterialIcons name="chevron-right" size={20} color="#789086" /> : null}
    </View>
  );
}

function Toggle() {
  return (
    <View style={styles.toggle}>
      <View style={styles.toggleKnob} />
    </View>
  );
}

function Badge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>UPDATE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9F4EA',
  },
  content: {
    padding: 18,
    paddingBottom: 104,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    padding: 17,
  },
  profileAvatar: {
    borderColor: '#D3E7DB',
    borderRadius: 31,
    borderWidth: 3,
    height: 62,
    width: 62,
  },
  profileText: {
    flex: 1,
  },
  name: {
    color: '#26302B',
    fontSize: 20,
    fontWeight: '900',
  },
  role: {
    color: '#5C6F65',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  label: {
    color: '#8C9E95',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  rowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    color: '#43524B',
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    color: '#50635A',
    fontSize: 14,
  },
  toggle: {
    alignItems: 'flex-start',
    backgroundColor: '#DDE9E2',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 42,
  },
  toggleKnob: {
    backgroundColor: '#5F806D',
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  badge: {
    backgroundColor: '#DDEDE2',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#7B9C8B',
    fontSize: 9,
    fontWeight: '900',
  },
  activityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  recentTitle: {
    color: '#0B1712',
    fontSize: 17,
    fontWeight: '800',
  },
  viewAll: {
    color: '#6A8E7C',
    fontSize: 13,
  },
  activityList: {
    gap: 9,
    marginTop: 10,
  },
  activityCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    padding: 13,
  },
  activityIcon: {
    alignItems: 'center',
    backgroundColor: '#EAF4EE',
    borderRadius: 11,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    color: '#5A6761',
    fontSize: 14,
    fontWeight: '800',
  },
  activityTime: {
    color: '#778A80',
    fontSize: 13,
    marginTop: 2,
  },
});
