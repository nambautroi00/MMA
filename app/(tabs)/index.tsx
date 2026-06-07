import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LiquidHeader } from "@/components/liquid-header";
import { TaskFormModal } from "@/components/task-form-modal";
import { useApp } from "@/context/app-context";
import { Task } from "@/constants/data";

export default function HomeScreen() {
  const { allTasks, stats, settings, toggleStatus, updateTask, addTask } = useApp();
  const router = useRouter();
  const isDark = settings.darkMode;

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCardPress = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setEditingTask(null);
    setShowForm(false);
  };

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Nam 👋";
    if (hour < 18) return "Good afternoon, Nam 👋";
    return "Good evening, Nam 👋";
  }, []);

  const focusToday = useMemo(() => {
    const today = new Date().toDateString();
    return allTasks
      .filter((t) => {
        if (t.status === "DONE") return false;
        const isDueToday = new Date(t.dueDate).toDateString() === today;
        return t.priority === "HIGH" || isDueToday;
      })
      .slice(0, 3);
  }, [allTasks]);

  const recentActivity = useMemo(() => {
    const sorted = [...allTasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted.slice(0, 3).map((t) => ({
      id: t.id,
      icon:
        t.status === "DONE"
          ? ("check-circle" as const)
          : t.status === "IN PROGRESS"
            ? ("play-circle" as const)
            : ("add-circle-outline" as const),
      label:
        t.status === "DONE"
          ? "Task Completed"
          : t.status === "IN PROGRESS"
            ? "Task Updated"
            : "Task Created",
      title: t.title,
      time: getRelativeTime(t.createdAt),
      color:
        t.status === "DONE"
          ? "#4CAF50"
          : t.status === "IN PROGRESS"
            ? "#FF9800"
            : "#2196F3",
    }));
  }, [allTasks]);

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
    border: {
      borderColor: isDark ? "#1A2520" : "#EAF0EC",
    },
    divider: {
      backgroundColor: isDark ? "#1A2520" : "#F0F5F2",
    }
  };

  return (
    <SafeAreaView style={[styles.screen, themeStyles.screen]}>
      <LiquidHeader showNotifications />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.greeting, themeStyles.textPrimary]}>{greeting}</Text>
          <Text style={[styles.subGreeting, themeStyles.textSecondary]}>
            {stats.pendingTasks > 0
              ? `You have ${stats.pendingTasks} pending task${stats.pendingTasks > 1 ? "s" : ""} for today.`
              : "All tasks completed! Have a wonderful day. ✨"}
          </Text>
        </View>

        {/* Hero Card - Today's Progress */}
        <View style={[styles.heroCard, isDark ? styles.heroCardDark : styles.heroCardLight]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Today's Progress</Text>
            <Text style={styles.heroSubtitle}>Focusing on what matters</Text>

            <View style={styles.heroStatsContainer}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{stats.totalTasks}</Text>
                <Text style={styles.heroStatLabel}>Total Tasks</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: "#A8DCD0" }]}>{stats.completedTasks}</Text>
                <Text style={styles.heroStatLabel}>Completed</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: "#FBBF24" }]}>{stats.pendingTasks}</Text>
                <Text style={styles.heroStatLabel}>Remaining</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.progressCircleContainer}>
              {/* Custom styled progress ring */}
              <View style={styles.progressRingOuter}>
                <View style={[
                  styles.progressRingInner,
                  { borderTopColor: "#5EEAD4", borderRightColor: stats.completionRate >= 50 ? "#5EEAD4" : "rgba(255,255,255,0.08)" }
                ]}>
                  <Text style={styles.progressPercent}>{stats.completionRate}%</Text>
                  <Text style={styles.progressLabel}>Done</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Focus Today */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>Focus Today</Text>
          <Text style={[styles.sectionSubLink, themeStyles.textSecondary]}>
            {focusToday.length} task{focusToday.length !== 1 ? "s" : ""} remaining
          </Text>
        </View>

        {focusToday.length === 0 ? (
          <View style={[styles.emptyBox, themeStyles.cardBg, styles.cardBorder]}>
            <View style={styles.emptyIconBg}>
              <MaterialIcons name="celebration" size={32} color="#5F806D" />
            </View>
            <Text style={[styles.emptyTextTitle, themeStyles.textPrimary]}>You're all caught up!</Text>
            <Text style={[styles.emptyTextSub, themeStyles.textSecondary]}>No high priority or pending tasks due today.</Text>
          </View>
        ) : (
          <View style={styles.focusContainer}>
            {focusToday.map((task) => (
              <Pressable
                key={task.id}
                style={[styles.focusCard, themeStyles.cardBg, styles.cardBorder]}
                onPress={() => handleCardPress(task)}
              >
                {/* Direct Toggle Checkbox */}
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => toggleStatus(task.id)}
                >
                  <View style={[
                    styles.checkbox,
                    task.status === "DONE" && styles.checkboxChecked,
                    task.status === "IN PROGRESS" && { borderColor: isDark ? "#10B981" : "#193C3A" },
                    task.status === "TODO" && { borderColor: isDark ? "#3A4D45" : "#AABFB3" }
                  ]}>
                    {task.status === "DONE" && (
                      <MaterialIcons name="check" size={14} color="#FFFFFF" />
                    )}
                    {task.status === "IN PROGRESS" && (
                      <View style={[styles.checkboxProgressDot, { backgroundColor: isDark ? "#10B981" : "#193C3A" }]} />
                    )}
                  </View>
                </Pressable>

                {/* Task Content */}
                <View style={styles.focusCardBody}>
                  <Text style={[styles.focusCardTitle, themeStyles.textPrimary]} numberOfLines={1}>
                    {task.title}
                  </Text>

                  <View style={styles.focusMetaRow}>
                    {/* Priority Dot and Label */}
                    <Text style={[styles.priorityLabelSimple, themeStyles.textSecondary]}>
                      <Text style={{
                        color: task.priority === "HIGH" ? "#EF4444" : task.priority === "MED" ? "#F59E0B" : "#10B981",
                        fontSize: 12,
                        fontWeight: "900"
                      }}>•</Text>  {task.priority === "HIGH" ? "High Priority" : task.priority === "MED" ? "Medium Priority" : "Low Priority"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Stats - Bento Grid */}
        <Text style={[styles.sectionTitle, themeStyles.textPrimary, { marginTop: 24, marginBottom: 12 }]}>
          Quick Stats
        </Text>
        <View style={styles.bentoGrid}>
          {/* Completed Stats */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(16, 185, 129, 0.1)" }]}>
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.completedTasks}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>Completed</Text>
            </View>
          </View>

          {/* Pending Stats */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(245, 158, 11, 0.1)" }]}>
              <MaterialIcons name="hourglass-empty" size={18} color="#F59E0B" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.pendingTasks}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>Pending</Text>
            </View>
          </View>

          {/* High Priority Stats */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <MaterialIcons name="priority-high" size={18} color="#EF4444" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.highPriorityCount}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>High Priority</Text>
            </View>
          </View>

          {/* Completion Rate Stats */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(59, 130, 246, 0.1)" }]}>
              <MaterialIcons name="trending-up" size={18} color="#3B82F6" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.completionRate}%</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>Rate</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, themeStyles.textPrimary, { marginTop: 24, marginBottom: 12 }]}>
          Recent Activity
        </Text>
        <View style={[styles.activityListContainer, themeStyles.cardBg, styles.cardBorder]}>
          {recentActivity.length === 0 ? (
            <Text style={[styles.emptyActivityText, themeStyles.textSecondary]}>No recent activities yet.</Text>
          ) : (
            recentActivity.map((activity, index) => (
              <View key={activity.id} style={styles.activityItem}>
                {/* Timeline connector and dot */}
                <View style={styles.activityTimeline}>
                  <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
                  {index < recentActivity.length - 1 && (
                    <View style={[styles.activityLine, themeStyles.divider]} />
                  )}
                </View>

                {/* Activity Detail */}
                <View style={styles.activityContent}>
                  <View style={styles.activityHeader}>
                    <Text style={[styles.activityLabel, themeStyles.textSecondary]}>
                      {activity.label}
                    </Text>
                    <Text style={[styles.activityTime, themeStyles.textSecondary]}>
                      {activity.time}
                    </Text>
                  </View>
                  <Text style={[styles.activityTitle, themeStyles.textPrimary]} numberOfLines={1}>
                    {activity.title}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={[styles.fab, { backgroundColor: isDark ? "#10B981" : "#193C3A" }]}
        onPress={() => {
          setEditingTask(null);
          setShowForm(true);
        }}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <TaskFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingTask ? {
          title: editingTask.title,
          description: editingTask.description,
          category: editingTask.category,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate.split('T')[0],
          status: editingTask.status,
        } : undefined}
      />
    </SafeAreaView>
  );
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
    padding: 20,
    paddingTop: 84,
    paddingBottom: 110,
  },

  // Header Section
  headerSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },

  // Hero Card (Today's Progress)
  heroCard: {
    borderRadius: 20,
    flexDirection: "row",
    padding: 22,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  heroCardLight: {
    backgroundColor: "#163832",
    shadowColor: "#163832",
  },
  heroCardDark: {
    backgroundColor: "#12251D",
    shadowColor: "#000000",
  },
  heroLeft: {
    flex: 1,
    justifyContent: "center",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  heroSubtitle: {
    color: "#8FA39D",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  heroStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  heroStatLabel: {
    color: "#8FA39D",
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  heroRight: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  progressCircleContainer: {
    width: 88,
    height: 88,
    justifyContent: "center",
    alignItems: "center",
  },
  progressRingOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressRingInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderColor: "transparent",
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  progressLabel: {
    color: "#8FA39D",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 1,
  },

  // Focus Section Headers
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionSubLink: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Focus Cards Container
  focusContainer: {
    gap: 12,
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  focusCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkboxContainer: {
    paddingRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  checkboxProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  focusCardBody: {
    flex: 1,
    justifyContent: "center",
  },
  focusCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  focusMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  priorityLabelSimple: {
    fontSize: 12,
    fontWeight: "600",
  },


  // Empty State
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8F5EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTextTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptyTextSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },

  // Bento Grid
  bentoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  bentoCard: {
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 60,
  },
  bentoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  bentoTextContainer: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
  },
  bentoNumber: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 18,
  },
  bentoLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
  },

  // Activity Section
  activityListContainer: {
    padding: 18,
  },
  emptyActivityText: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
  },
  activityItem: {
    flexDirection: "row",
    minHeight: 52,
  },
  activityTimeline: {
    width: 24,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    zIndex: 2,
  },
  activityLine: {
    width: 1.5,
    position: "absolute",
    top: 15,
    bottom: -15,
    left: 11.25,
    zIndex: 1,
  },
  activityContent: {
    flex: 1,
    marginLeft: 8,
    paddingBottom: 16,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  activityTime: {
    fontSize: 10,
    fontWeight: "500",
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },

  // FAB
  fab: {
    alignItems: "center",
    borderRadius: 28,
    bottom: 84,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    width: 56,
  },
});
