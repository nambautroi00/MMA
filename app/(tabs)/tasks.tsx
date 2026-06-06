import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';

const filters = ['All', 'Pending', 'High Priority', 'Study'];

const tasks = [
  {
    title: 'Q4 Strategy Deck',
    note: 'Finalize the visual storytelling components for the upcoming quarterly board meeting and investor...',
    category: 'WORK',
    priority: 'HIGH',
    date: 'Oct 24',
    status: 'IN PROGRESS',
  },
  {
    title: 'Advanced UI Patterns',
    note: 'Complete the research module on micro-interactions and spatial layout systems for...',
    category: 'STUDY',
    priority: 'MED',
    date: 'Oct 26',
    status: 'TODO',
  },
];

export default function TasksScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <LiquidHeader />

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color="#637970" />
            <TextInput
              placeholder="Search tasks..."
              placeholderTextColor="#A2AEA8"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.tuneButton}>
            <MaterialIcons name="tune" size={22} color="#6A8E7C" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.chipRow}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {filters.map((filter, index) => (
            <View key={filter} style={[styles.chip, index === 0 && styles.chipActive]}>
              <Text style={[styles.chipText, index === 0 && styles.chipTextActive]}>{filter}</Text>
            </View>
          ))}
        </ScrollView>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <TaskCard task={item} />}
        />
      </View>

      <Pressable style={styles.fab}>
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

function TaskCard({ task }: { task: (typeof tasks)[number] }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tags}>
          <Text style={styles.tag}>{task.category}</Text>
          <Text style={[styles.tag, styles.priorityTag]}>{task.priority}</Text>
        </View>
        <MaterialIcons name="more-vert" size={20} color="#B4C0BA" />
      </View>
      <Text style={styles.cardTitle}>{task.title}</Text>
      <Text style={styles.cardNote}>{task.note}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.datePill}>
          <MaterialIcons name="event" size={12} color="#6F8078" />
          <Text style={styles.dateText}>{task.date}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#DDEEDF',
  },
  content: {
    flex: 1,
    padding: 18,
    paddingBottom: 90,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 50,
    paddingHorizontal: 18,
  },
  searchInput: {
    color: '#34433C',
    flex: 1,
    fontSize: 15,
  },
  tuneButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  chipRow: {
    gap: 10,
    paddingVertical: 16,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 19,
  },
  chipActive: {
    backgroundColor: '#5F806D',
  },
  chipText: {
    color: '#7C8B83',
    fontSize: 14,
    fontWeight: '800',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    gap: 16,
    paddingBottom: 118,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 124,
    padding: 17,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    gap: 7,
  },
  tag: {
    backgroundColor: '#E1F0E4',
    borderRadius: 9,
    color: '#7CA086',
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  priorityTag: {
    backgroundColor: '#FFE5E3',
    color: '#D94F45',
  },
  cardTitle: {
    color: '#415149',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  cardNote: {
    color: '#6C7C74',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 6,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  datePill: {
    alignItems: 'center',
    backgroundColor: '#EEF4EF',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateText: {
    color: '#6F8078',
    fontSize: 11,
    fontWeight: '800',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  statusDot: {
    backgroundColor: '#6FA77D',
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  statusText: {
    color: '#6F8078',
    fontSize: 9,
    fontWeight: '900',
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
