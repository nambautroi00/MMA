import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LiquidHeader } from '@/components/liquid-header';
import { useApp } from '@/context/app-context';

export default function StatsScreen() {
  const { stats, settings, t } = useApp();
  const isDark = settings.darkMode;

  // Peak day text
  const peakDayText = stats.peakDay 
    ? t('peakActivity', { day: t(stats.peakDay as any) }) 
    : t('noActivityLogged');

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
    cardTintTotal: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(25, 60, 58, 0.05)",
      borderColor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(25, 60, 58, 0.08)",
    },
    cardTintDone: {
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.05)",
      borderColor: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.08)",
    },
    cardTintMissed: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.08)" : "rgba(239, 68, 68, 0.05)",
      borderColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.08)",
    },
    divider: {
      backgroundColor: isDark ? "#1A2520" : "#F0F5F2",
    }
  };

  // Overdue Rate Feedback details
  const overdueDetails = useMemo(() => {
    const rate = stats.overdueRate;
    if (rate === 0) return { label: t('clean'), desc: t('allCaughtUp'), color: '#10B981' };
    if (rate <= 15) return { label: t('onTrack'), desc: t('good'), color: '#3B82F6' };
    return { label: t('warning'), desc: t('needsFocus'), color: '#EF4444' };
  }, [stats.overdueRate, t]);

  // Completion Rate Feedback details
  const completionDetails = useMemo(() => {
    const rate = stats.completionRate;
    if (rate >= 80) return { label: t('excellent'), desc: t('highlyProductive'), color: '#10B981' };
    if (rate >= 50) return { label: t('good'), desc: t('solidConsistency'), color: '#3B82F6' };
    return { label: t('needsFocus'), desc: t('stepUpTasks'), color: '#F59E0B' };
  }, [stats.completionRate, t]);

  // Max value of weekly activity to calculate height of bars
  const maxWeeklyActivity = useMemo(() => {
    return Math.max(1, ...stats.weeklyActivity);
  }, [stats.weeklyActivity]);

  // Days of week label mapping
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={[styles.screen, themeStyles.screen]}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Screen Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.pageTitle, themeStyles.textPrimary]}>{t('insightsTitle')}</Text>
          <Text style={[styles.subtitle, themeStyles.textSecondary]}>{t('insightsSub')}</Text>
        </View>

        {/* Hero Score Cards (Glassmorphic Styled Row) */}
        <View style={[styles.heroRow, isDark ? styles.heroRowDark : styles.heroRowLight]}>
          {/* Completion Rate Card */}
          <View style={styles.heroColumn}>
            <Text style={styles.heroCardTitle}>{t('completion')}</Text>
            <Text style={styles.heroCardSub}>{t('successRate')}</Text>

            <View style={styles.ringContainer}>
              <View style={styles.progressRingOuter}>
                <View style={[
                  styles.progressRingInner,
                  {
                    borderTopColor: '#3B82F6',
                    borderRightColor: stats.completionRate >= 50 ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                    borderBottomColor: stats.completionRate >= 75 ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                    borderLeftColor: stats.completionRate >= 95 ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                  }
                ]}>
                  <Text style={styles.ringScoreText}>{stats.completionRate}%</Text>
                  <Text style={styles.ringLabelText}>DONE</Text>
                </View>
              </View>
            </View>
            <View style={[styles.feedbackBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.feedbackText, { color: completionDetails.color }]}>{completionDetails.desc}</Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.heroDivider} />

          {/* Overdue Rate Card */}
          <View style={styles.heroColumn}>
            <Text style={styles.heroCardTitle}>{t('overdueRateLabel')}</Text>
            <Text style={styles.heroCardSub}>{t('overdueTasksLabel')}</Text>
            
            <View style={styles.ringContainer}>
              <View style={styles.progressRingOuter}>
                <View style={[
                  styles.progressRingInner,
                  {
                    borderTopColor: stats.overdueRate > 0 ? '#EF4444' : 'rgba(255,255,255,0.06)',
                    borderRightColor: stats.overdueRate >= 25 ? '#EF4444' : 'rgba(255,255,255,0.06)',
                    borderBottomColor: stats.overdueRate >= 50 ? '#EF4444' : 'rgba(255,255,255,0.06)',
                    borderLeftColor: stats.overdueRate >= 75 ? '#EF4444' : 'rgba(255,255,255,0.06)',
                  }
                ]}>
                  <Text style={styles.ringScoreText}>{stats.overdueRate}%</Text>
                  <Text style={styles.ringLabelText}>OVERDUE</Text>
                </View>
              </View>
            </View>
            <View style={[styles.feedbackBadge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.feedbackText, { color: overdueDetails.color }]}>{overdueDetails.label}</Text>
            </View>
          </View>
        </View>

        {/* Bento Key Counters */}
        <View style={styles.bentoGrid}>
          {/* Total tasks */}
          <View style={[styles.bentoCard, themeStyles.cardBg, themeStyles.cardTintTotal, styles.cardBorder]}>
            <MaterialIcons name="grid-on" size={18} color={isDark ? "#10B981" : "#193C3A"} />
            <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.totalTasks}</Text>
            <Text style={[styles.bentoLabel, themeStyles.textSecondary]}>{t('totalTasks')}</Text>
          </View>

          {/* Completed */}
          <View style={[styles.bentoCard, themeStyles.cardBg, themeStyles.cardTintDone, styles.cardBorder]}>
            <MaterialIcons name="check-circle" size={18} color="#3B82F6" />
            <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.completedTasks}</Text>
            <Text style={[styles.bentoLabel, themeStyles.textSecondary]}>{t('completed')}</Text>
          </View>

          {/* Overdue/Missed */}
          <View style={[styles.bentoCard, themeStyles.cardBg, themeStyles.cardTintMissed, styles.cardBorder]}>
            <MaterialIcons name="warning" size={18} color="#EF4444" />
            <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.missedTasks}</Text>
            <Text style={[styles.bentoLabel, themeStyles.textSecondary]}>{t('overdue')}</Text>
          </View>
        </View>

        {/* Weekly Activity Custom Bar Chart */}
        <View style={[styles.card, themeStyles.cardBg, styles.cardBorder]}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>{t('weeklyActivity')}</Text>
              <Text style={[styles.sectionSubtitle, themeStyles.textSecondary]}>{t('tasksAddedPerDay')}</Text>
            </View>
            <View style={[styles.peakBadge, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "rgba(239, 68, 68, 0.08)" }]}>
              <Text style={styles.peakBadgeText}>{peakDayText}</Text>
            </View>
          </View>

          {/* Bar Chart Container */}
          <View style={styles.chartWrapper}>
            <View style={styles.barsContainer}>
              {/* Grid lines in background */}
              <View style={styles.gridLinesContainer}>
                <View style={[styles.gridLine, { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]} />
                <View style={[styles.gridLine, { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]} />
                <View style={[styles.gridLine, { borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]} />
              </View>

              {stats.weeklyActivity.map((val, index) => {
                const dayName = daysOfWeek[index];
                const isPeak = dayName === stats.peakDay;
                const barHeight = val > 0 ? (val / maxWeeklyActivity) * 90 : 6;
                const activeColor = isPeak ? '#EF4444' : (isDark ? '#10B981' : '#193C3A');

                return (
                  <View key={index} style={styles.chartColumn}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barValue, { height: barHeight, backgroundColor: activeColor }]} />
                    </View>
                    <Text style={[styles.chartDayText, isPeak && styles.peakDayText, themeStyles.textSecondary]}>
                      {t(dayName as any)}
                    </Text>
                    {val > 0 && (
                      <View style={[styles.valueBubble, { backgroundColor: isDark ? '#1A2520' : '#EAF4EE' }]}>
                        <Text style={[styles.valueBubbleText, { color: activeColor }]}>{val}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Status Distribution Segment Bar & Legend */}
        <View style={[styles.card, themeStyles.cardBg, styles.cardBorder, { marginBottom: 30 }]}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>{t('statusBreakdown')}</Text>
          <Text style={[styles.sectionSubtitle, themeStyles.textSecondary]}>{t('workspaceDistribution')}</Text>

          {stats.totalTasks === 0 ? (
            <Text style={[styles.emptyStatsText, themeStyles.textSecondary]}>{t('noTasksCreatedYet')}</Text>
          ) : (
            <View style={styles.statusSection}>
              {/* Stacked distribution bar */}
              <View style={[styles.distributionBar, { backgroundColor: isDark ? "#1C2521" : "#EEF4F0" }]}>
                {stats.todoCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.todoPercent}%` as DimensionValue, backgroundColor: '#8A9BA8' }]} />
                )}
                {stats.inProgressCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.inProgressPercent}%` as DimensionValue, backgroundColor: '#F59E0B' }]} />
                )}
                {stats.doneCount > 0 && (
                  <View style={[styles.distributionSegment, { width: `${stats.donePercent}%` as DimensionValue, backgroundColor: '#10B981' }]} />
                )}
              </View>

              {/* Status Grid Legend */}
              <View style={styles.legendGrid}>
                {/* Todo Column */}
                <View style={styles.legendCol}>
                  <View style={[styles.legendDot, { backgroundColor: '#8A9BA8' }]} />
                  <View style={styles.legendInfo}>
                    <Text style={[styles.legendText, themeStyles.textPrimary]}>{t('toDo')}</Text>
                    <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>
                      {t('tasksCount', { count: stats.todoCount, plural: stats.todoCount !== 1 ? 's' : '' })} ({stats.todoPercent}%)
                    </Text>
                  </View>
                </View>

                {/* In Progress Column */}
                <View style={styles.legendCol}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <View style={styles.legendInfo}>
                    <Text style={[styles.legendText, themeStyles.textPrimary]}>{t('inProgress')}</Text>
                    <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>
                      {t('tasksCount', { count: stats.inProgressCount, plural: stats.inProgressCount !== 1 ? 's' : '' })} ({stats.inProgressPercent}%)
                    </Text>
                  </View>
                </View>

                {/* Completed Column */}
                <View style={styles.legendCol}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <View style={styles.legendInfo}>
                    <Text style={[styles.legendText, themeStyles.textPrimary]}>{t('completed')}</Text>
                    <Text style={[styles.legendSubtext, themeStyles.textSecondary]}>
                      {t('tasksCount', { count: stats.doneCount, plural: stats.doneCount !== 1 ? 's' : '' })} ({stats.donePercent}%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
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
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  
  // Hero Score Card (Row container)
  heroRow: {
    borderRadius: 20,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 5,
  },
  heroRowLight: {
    backgroundColor: '#163832',
    shadowColor: '#163832',
  },
  heroRowDark: {
    backgroundColor: '#12251D',
    shadowColor: '#000000',
  },
  heroColumn: {
    flex: 1,
    alignItems: 'center',
  },
  heroCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  heroCardSub: {
    color: '#8FA39D',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: '90%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  
  // Custom styled progress ring
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  progressRingOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: 'transparent',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringScoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  ringLabelText: {
    color: '#8FA39D',
    fontSize: 7,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  feedbackBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  feedbackText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Bento Box Counters
  bentoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  bentoCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  bentoNumber: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Bar Chart Layout
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  peakBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  peakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  chartWrapper: {
    height: 140,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingHorizontal: 4,
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 90,
    bottom: 20, // aligns with base of barTrack (which starts above day label height)
    justifyContent: 'space-between',
  },
  gridLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: 90,
    width: 14,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barValue: {
    width: 10,
    borderRadius: 5,
  },
  chartDayText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  peakDayText: {
    fontWeight: '800',
    color: '#EF4444',
  },
  valueBubble: {
    position: 'absolute',
    top: -12,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
  },
  valueBubbleText: {
    fontSize: 9,
    fontWeight: '800',
  },

  // Section details
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyStatsText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },


  // Status breakdown styles
  statusSection: {
    marginTop: 16,
  },
  distributionBar: {
    height: 12,
    borderRadius: 6,
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
    marginTop: 18,
    gap: 8,
  },
  legendCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  legendInfo: {
    flex: 1,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendSubtext: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },


});