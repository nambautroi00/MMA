import { Image, ScrollView, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';

const categories = [
  { label: 'Creative Design', value: '42%', width: '92%' as DimensionValue },
  { label: 'Team Management', value: '28%', width: '66%' as DimensionValue },
  { label: 'Research & Dev', value: '18%', width: '44%' as DimensionValue },
  { label: 'Admin', value: '12%', width: '31%' as DimensionValue },
];

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Analytics</Text>
        <Text style={styles.subtitle}>Insights into your flow and performance.</Text>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>CURRENT FLOW</Text>
          <Text style={styles.cardTitle}>Productivity Score</Text>
          <Text style={styles.cardText}>Performing 12% better than last week.</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>View Details</Text>
          </View>
          <View style={styles.ring}>
            <Text style={styles.score}>85</Text>
            <Text style={styles.scoreLabel}>OF 100</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>By Category</Text>
          {categories.map((item) => (
            <View key={item.label} style={styles.categoryRow}>
              <View style={styles.categoryTop}>
                <Text style={styles.categoryLabel}>{item.label}</Text>
                <Text style={styles.categoryValue}>{item.value}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: item.width }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <Text style={styles.smallText}>Completed tasks over last 7 days.</Text>
          <View style={styles.segmented}>
            <Text style={[styles.segment, styles.segmentActive]}>Daily</Text>
            <Text style={styles.segment}>Weekly</Text>
          </View>
          <View style={styles.chart}>
            {[22, 44, 30, 62, 36, 70, 48].map((height, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={[styles.chartBar, { height }]} />
              </View>
            ))}
          </View>
          <View style={styles.days}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <Text key={day} style={styles.dayText}>{day}</Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tasks by Priority</Text>
          <View style={styles.priorityGrid}>
            <View style={styles.priorityCard}>
              <Text style={styles.priorityIcon}>!</Text>
              <Text style={styles.priorityValue}>4</Text>
              <Text style={styles.priorityLabel}>High</Text>
            </View>
            <View style={styles.priorityCard}>
              <Text style={styles.priorityIconGreen}>-</Text>
              <Text style={styles.priorityValue}>12</Text>
              <Text style={styles.priorityLabel}>Medium</Text>
            </View>
          </View>
          <Text style={styles.quote}>
            {'"Focus on High Priority tasks during your peak flow between 8AM and 10AM."'}
          </Text>
        </View>

        <View style={styles.imagePanel}>
          <Image source={require('../../assets/images/react-logo.png')} style={styles.panelImage} />
          <Text style={styles.imageTitle}>Optimized Peak Performance</Text>
          <Text style={styles.imageText}>Morning deep-work yields the highest results.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  pageTitle: {
    color: '#4F7965',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#41574C',
    fontSize: 11,
    marginTop: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 14,
    padding: 16,
  },
  cardEyebrow: {
    color: '#93A49B',
    fontSize: 10,
    fontWeight: '900',
  },
  cardTitle: {
    color: '#25322C',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 5,
  },
  cardText: {
    color: '#6D7F76',
    fontSize: 12,
    marginTop: 3,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#5F806D',
    borderRadius: 8,
    marginTop: 14,
    paddingHorizontal: 17,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  ring: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#7FAF92',
    borderLeftColor: '#DCEBE0',
    borderRadius: 54,
    borderWidth: 7,
    height: 104,
    justifyContent: 'center',
    marginTop: 15,
    width: 104,
  },
  score: {
    color: '#5F806D',
    fontSize: 28,
    fontWeight: '900',
  },
  scoreLabel: {
    color: '#7C8A83',
    fontSize: 9,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#516358',
    fontSize: 14,
    fontWeight: '900',
  },
  categoryRow: {
    marginTop: 12,
  },
  categoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    color: '#45564D',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryValue: {
    color: '#45564D',
    fontSize: 10,
    fontWeight: '800',
  },
  track: {
    backgroundColor: '#EAF2EC',
    borderRadius: 8,
    height: 5,
    marginTop: 5,
  },
  fill: {
    backgroundColor: '#6D927F',
    borderRadius: 8,
    height: '100%',
  },
  smallText: {
    color: '#8B9992',
    fontSize: 11,
    marginTop: 3,
  },
  segmented: {
    backgroundColor: '#EEF5F0',
    borderRadius: 8,
    flexDirection: 'row',
    marginTop: 12,
    padding: 3,
    width: 112,
  },
  segment: {
    color: '#8A9991',
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 5,
    textAlign: 'center',
  },
  segmentActive: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    color: '#577A68',
    overflow: 'hidden',
  },
  chart: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 112,
    justifyContent: 'space-between',
    marginTop: 15,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    backgroundColor: '#C8DCD0',
    borderRadius: 7,
    width: 11,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayText: {
    color: '#8C9A93',
    fontSize: 9,
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  priorityCard: {
    alignItems: 'center',
    backgroundColor: '#F7FBF8',
    borderRadius: 10,
    flex: 1,
    paddingVertical: 16,
  },
  priorityIcon: {
    color: '#E44F4A',
    fontSize: 20,
    fontWeight: '900',
  },
  priorityIconGreen: {
    color: '#6D927F',
    fontSize: 20,
    fontWeight: '900',
  },
  priorityValue: {
    color: '#334139',
    fontSize: 22,
    fontWeight: '900',
  },
  priorityLabel: {
    color: '#8B9992',
    fontSize: 10,
    fontWeight: '800',
  },
  quote: {
    color: '#6B7B73',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 17,
    marginTop: 14,
  },
  imagePanel: {
    backgroundColor: '#23322E',
    borderRadius: 12,
    marginTop: 14,
    minHeight: 180,
    overflow: 'hidden',
    padding: 14,
  },
  panelImage: {
    alignSelf: 'center',
    height: 122,
    resizeMode: 'contain',
    width: 180,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  imageText: {
    color: '#D9E9DF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
});
