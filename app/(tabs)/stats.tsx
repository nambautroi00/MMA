import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';
import { useApp } from '@/context/app-context';

export default function StatsScreen() {
  const { stats, settings, createdCount, completedCount, deletedCount } = useApp();
  const isDark = settings.darkMode;

  // Dynamic theme styles
  const themeStyles = {
    screen: {
      backgroundColor: isDark ? "#0A100D" : "#F4F8F6",
    },
    textPrimary: {
      color: isDark ? "#EBF1EE" : "#192420",
    },
    textSecondary: {
      color: isDark ? "#8F9D97" : "#5F7068",
    },
    cardBg: {
      backgroundColor: isDark ? "#121A17" : "#FFFFFF",
      borderColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
    },
    divider: {
      backgroundColor: isDark ? "#1A2520" : "#F0F5F2",
    }
  };

  return (
    <SafeAreaView style={[styles.screen, themeStyles.screen]}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, themeStyles.textPrimary]}>Insights & Analytics</Text>
          <Text style={[styles.subtitle, themeStyles.textSecondary]}>Deep dive into your workflow performance.</Text>
        </View>

        {/* Productivity & Completion Row */}
        <View style={styles.dualRow}>
          {/* Productivity Score */}
          <View style={[styles.card, themeStyles.cardBg, styles.cardBorder, { flex: 1 }]}>
            <Text style={[styles.cardTitle, themeStyles.textPrimary]}>Productivity</Text>
            <Text style={[styles.cardSubtitle, themeStyles.textSecondary]}>Score (0-100)</Text>
            
            <View style={styles.ringContainer}>
              <View style={[styles.scoreRing, { borderColor: isDark ? "#10B981" : "#193C3A" }]}>
                <Text style={[styles.scoreNumber, themeStyles.textPrimary]}>{stats.productivityScore}</Text>
                <Text style={styles.scoreLabel}>OF 100</Text>
              </View>
            </View>
          </View>

          {/* Completion Rate */}
          <View style={[styles.card, themeStyles.cardBg, styles.cardBorder, { flex: 1 }]}>
            <Text style={[styles.cardTitle, themeStyles.textPrimary]}>Completion</Text>
            <Text style={[styles.cardSubtitle, themeStyles.textSecondary]}>Rate %</Text>
            
            <View style={styles.ringContainer}>
              <View style={[styles.scoreRing, { borderColor: "#3B82F6" }]}>
                <Text style={[styles.scoreNumber, themeStyles.textPrimary]}>{stats.completionRate}%</Text>
                <Text style={styles.scoreLabel}>Success</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={[styles.card, themeStyles.cardBg, styles.cardBorder]}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>Category Breakdown</Text>
          <Text style={[styles.sectionSubtitle, themeStyles.textSecondary]}>Distribution of tasks by category</Text>
          
          {stats.tasksByCategory.length === 0 ? (
            <Text style={[styles.emptyStatsText, themeStyles.textSecondary]}>No tasks to categorize yet.</Text>
          ) : (
            <View style={styles.categoryList}>
              {stats.tasksByCategory.map((item) => {
                let categoryColor = '#8A9BA8'; // Default Other
                if (item.label === 'Work') categoryColor = '#10B981';
                if (item.label === 'Study') categoryColor = '#3B82F6';
                if (item.label === 'Personal') categoryColor = '#F59E0B';

                return (
                  <View key={item.label} style={styles.categoryRow}>
                    <View style={styles.categoryHeader}>
                      <Text style={[styles.categoryLabel, themeStyles.textPrimary]}>{item.label}</Text>
                      <Text style={[styles.categoryValue, themeStyles.textPrimary]}>{item.value} ({item.count} tasks)</Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? "#1A2520" : "#EEF4F0" }]}>
                      <View style={[styles.progressBar, { width: item.width as DimensionValue, backgroundColor: categoryColor }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Status Distribution */}
        <View style={[styles.card, themeStyles.cardBg, styles.cardBorder]}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>Status Distribution</Text>
          <Text style={[styles.sectionSubtitle, themeStyles.textSecondary]}>Live status of your workspace tasks</Text>

          {stats.totalTasks === 0 ? (
            <Text style={[styles.emptyStatsText, themeStyles.textSecondary]}>No tasks created yet.</Text>
          ) : (
            <View style={styles.statusSection}>
              {/* Stacked distribution bar */}
              <View style={styles.distributionBar}>
                {stats.todoCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.todoPercent}%` as DimensionValue, backgroundColor: '#8A9BA8' }]} />
                )}
                {stats.inProgressCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.inProgressPercent}%` as DimensionValue, backgroundColor: '#F59E0B' }]} />
                )}
                {stats.reviewCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.reviewPercent}%` as DimensionValue, backgroundColor: '#3B82F6' }]} />
                )}
                {stats.doneCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.donePercent}%` as DimensionValue, backgroundColor: '#10B981' }]} />
                )}
              </View>

              {/* Status Grid Legend */}
              <View style={styles.legendGrid}>
                <View style={styles.legendCol}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#8A9BA8' }]} />
                    <View>
                      <Text style={[styles.legendText, themeStyles.textPrimary]}>Todo</Text>
                      <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>{stats.todoCount} tasks ({stats.todoPercent}%)</Text>
                    </View>
                  </View>
                  <View style={[styles.legendRow, { marginTop: 12 }]}>
                    <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                    <View>
                      <Text style={[styles.legendText, themeStyles.textPrimary]}>Review</Text>
                      <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>{stats.reviewCount} tasks ({stats.reviewPercent}%)</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.legendCol}>
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                    <View>
                      <Text style={[styles.legendText, themeStyles.textPrimary]}>In Progress</Text>
                      <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>{stats.inProgressCount} tasks ({stats.inProgressPercent}%)</Text>
                    </View>
                  </View>
                  <View style={[styles.legendRow, { marginTop: 12 }]}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <View>
                      <Text style={[styles.legendText, themeStyles.textPrimary]}>Done</Text>
                      <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>{stats.doneCount} tasks ({stats.donePercent}%)</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Weekly Summary */}
        <View style={[styles.card, themeStyles.cardBg, styles.cardBorder]}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>Weekly Summary</Text>
          <Text style={[styles.sectionSubtitle, themeStyles.textSecondary]}>Activity overview in this workspace</Text>
          
          <View style={styles.summaryGrid}>
            {/* Created Tasks */}
            <View style={[styles.summaryCard, { backgroundColor: isDark ? "#16221D" : "#EAF7EE" }]}>
              <MaterialIcons name="add-circle-outline" size={20} color="#10B981" />
              <Text style={[styles.summaryNumber, themeStyles.textPrimary]}>{createdCount}</Text>
              <Text style={[styles.summaryLabel, themeStyles.textSecondary]}>Created</Text>
            </View>

            {/* Completed Tasks */}
            <View style={[styles.summaryCard, { backgroundColor: isDark ? "#14222C" : "#EBF5FC" }]}>
              <MaterialIcons name="check-circle-outline" size={20} color="#3B82F6" />
              <Text style={[styles.summaryNumber, themeStyles.textPrimary]}>{completedCount}</Text>
              <Text style={[styles.summaryLabel, themeStyles.textSecondary]}>Completed</Text>
            </View>

            {/* Deleted Tasks */}
            <View style={[styles.summaryCard, { backgroundColor: isDark ? "#281919" : "#FDECEB" }]}>
              <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
              <Text style={[styles.summaryNumber, themeStyles.textPrimary]}>{deletedCount}</Text>
              <Text style={[styles.summaryLabel, themeStyles.textSecondary]}>Deleted</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 84,
    paddingBottom: 110,
  },
  headerSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardBorder: {
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  dualRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  scoreRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8A9991',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  emptyStatsText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
  },
  categoryList: {
    marginTop: 16,
    gap: 12,
  },
  categoryRow: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statusSection: {
    marginTop: 16,
  },
  distributionBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
  distributionSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },
  legendCol: {
    flex: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  legendSubtext: {
    fontSize: 10,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
});