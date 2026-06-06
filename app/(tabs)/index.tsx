import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';

const performance = [
  { label: 'Total Tasks', value: '124', icon: 'checklist', accent: '#DCECE3' },
  { label: 'Success', value: '92%', icon: 'check-circle-outline', accent: '#DCECE3' },
  { label: 'Activities', value: '48', icon: 'bolt', accent: '#DCECE3' },
  { label: 'Peak Time', value: 'Tue, 10:00\nAM', icon: 'bar-chart', accent: '#F4F0E5' },
  { label: 'Missed', value: '02', icon: 'priority-high', accent: '#FFE6E3', danger: true },
];

const upcoming = [
  { title: 'Design System Overhaul', time: '4:00 PM', level: 'HIGH', icon: 'brush' },
  { title: 'Quarterly Review Deck', time: 'Tomorrow', level: 'MID', icon: 'image' },
  { title: 'Marketing Strategy Sync', time: '14 Oct', level: 'LOW', icon: 'campaign' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <LiquidHeader showNotifications />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.greeting}>Good Morning, Alex</Text>
        <Text style={styles.subGreeting}>5 high-priority tasks today.</Text>

        <View style={styles.heroCard}>
          <View style={styles.progressRing}>
            <Text style={styles.percent}>75%</Text>
            <Text style={styles.done}>Done</Text>
          </View>
          <View style={styles.summaryRow}>
            <Summary label="Completed" value="12" color="#5C8E79" />
            <Summary label="Pending" value="04" color="#5C8E79" />
            <Summary label="High Priority" value="05" color="#D94F45" />
          </View>
        </View>

        <SectionTitle icon="insert-chart-outlined" title="Performance" />
        <View style={styles.grid}>
          {performance.map((item) => (
            <View key={item.label} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: item.accent }]}>
                <MaterialIcons
                  name={item.icon as keyof typeof MaterialIcons.glyphMap}
                  size={18}
                  color={item.danger ? '#E85A53' : '#6D927F'}
                />
              </View>
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text style={[styles.metricValue, item.danger && styles.dangerText]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitle icon="event-note" title="Upcoming" compact />
          <Text style={styles.viewAll}>View All</Text>
        </View>

        <View style={styles.upcomingList}>
          {upcoming.map((task) => (
            <View key={task.title} style={styles.upcomingCard}>
              <View style={styles.taskIcon}>
                <MaterialIcons
                  name={task.icon as keyof typeof MaterialIcons.glyphMap}
                  size={18}
                  color="#668D78"
                />
              </View>
              <View style={styles.taskBody}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={styles.taskMeta}>
                  <MaterialIcons name="schedule" size={12} color="#7F9188" />
                  <Text style={styles.taskMetaText}>{task.time}</Text>
                  <Text style={[styles.level, task.level === 'HIGH' && styles.high]}>
                    {task.level}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="more-vert" size={20} color="#6D7D75" />
            </View>
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.fab}>
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

function Summary({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <View style={[styles.summaryLine, { backgroundColor: color }]} />
    </View>
  );
}

function SectionTitle({
  icon,
  title,
  compact,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.titleRow, compact && styles.titleRowCompact]}>
      <MaterialIcons name={icon} size={18} color="#557866" />
      <Text style={styles.sectionTitle}>{title}</Text>
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
    paddingBottom: 118,
  },
  greeting: {
    color: '#202B25',
    fontSize: 23,
    fontWeight: '800',
  },
  subGreeting: {
    color: '#62776D',
    fontSize: 13,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 14,
    padding: 20,
    shadowColor: '#8BAA97',
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  progressRing: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#8FBE9D',
    borderLeftColor: '#E8F1EA',
    borderRadius: 62,
    borderWidth: 8,
    height: 118,
    justifyContent: 'center',
    width: 118,
  },
  percent: {
    color: '#7AAA88',
    fontSize: 27,
    fontWeight: '900',
  },
  done: {
    color: '#56665E',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: '#8A9991',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  summaryLine: {
    borderRadius: 999,
    height: 3,
    marginTop: 8,
    width: '80%',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    marginTop: 22,
  },
  titleRowCompact: {
    marginTop: 0,
  },
  sectionTitle: {
    color: '#26302B',
    fontSize: 21,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 108,
    padding: 15,
    width: '47.5%',
  },
  metricIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  metricLabel: {
    color: '#7B877F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 16,
  },
  metricValue: {
    color: '#26302B',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  dangerText: {
    color: '#E34C49',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  viewAll: {
    color: '#6A8E7C',
    fontSize: 13,
  },
  upcomingList: {
    gap: 10,
    marginTop: 12,
  },
  upcomingCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  taskIcon: {
    alignItems: 'center',
    backgroundColor: '#E4F0E8',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    color: '#53625A',
    fontSize: 14,
    fontWeight: '800',
  },
  taskMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
  },
  taskMetaText: {
    color: '#788880',
    fontSize: 11,
    fontWeight: '700',
  },
  level: {
    backgroundColor: '#E7EFE9',
    borderRadius: 4,
    color: '#6F8279',
    fontSize: 9,
    fontWeight: '900',
    marginLeft: 4,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  high: {
    backgroundColor: '#FFE5E3',
    color: '#D94F45',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: '#5F806D',
    borderRadius: 28,
    bottom: 72,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#315743',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    width: 56,
  },
});
