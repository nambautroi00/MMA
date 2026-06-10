import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LiquidHeader } from "@/components/liquid-header";
import { TaskFormModal } from "@/components/task-form-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useApp } from "@/context/app-context";
import { Task, TaskStatus } from "@/constants/data";

export default function HomeScreen() {
  const {
    allTasks,
    stats,
    settings,
    toggleStatus,
    updateTask,
    addTask,
    deleteTask,
    setActiveFocusTask,
    setShowFocusTimerModal,
    t,
  } = useApp();
  const isDark = settings.darkMode;

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Bottom sheet details state
  const [detailTarget, setDetailTarget] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleCardPress = (task: Task) => {
    setDetailTarget(task);
    setShowDetail(true);
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

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const name = settings.profileName || 'Nam';
    if (hour < 12) return t("goodMorning", { name });
    if (hour < 18) return t("goodAfternoon", { name });
    return t("goodEvening", { name });
  }, [t, settings.profileName]);

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

  const activeWorkCount = useMemo(() => {
    return allTasks.filter((t) => t.category === "WORK" && t.status !== "DONE").length;
  }, [allTasks]);

  const activeStudyCount = useMemo(() => {
    return allTasks.filter((t) => t.category === "STUDY" && t.status !== "DONE").length;
  }, [allTasks]);

  const recentActivity = useMemo(() => {
    const sorted = [...allTasks].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return sorted.slice(0, 3).map((task) => ({
      id: task.id,
      icon:
        task.status === "DONE"
          ? ("check-circle" as const)
          : task.status === "IN PROGRESS"
            ? ("play-circle" as const)
            : ("add-circle-outline" as const),
      label:
        task.status === "DONE"
          ? t("taskCompleted")
          : task.status === "IN PROGRESS"
            ? t("taskUpdated")
            : t("taskCreated"),
      title: task.title,
      time: getRelativeTime(task.createdAt, t),
      color:
        task.status === "DONE"
          ? "#4CAF50"
          : task.status === "IN PROGRESS"
            ? "#FF9800"
            : "#2196F3",
    }));
  }, [allTasks, t]);

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
              ? t('pendingTasksMsg', { count: stats.pendingTasks, plural: stats.pendingTasks > 1 ? 's' : '' })
              : t('allTasksCompleted')}
          </Text>
        </View>

        {/* Hero Card - Today's Progress */}
        <View style={[styles.heroCard, isDark ? styles.heroCardDark : styles.heroCardLight]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>{t('todaysProgress')}</Text>
            <Text style={styles.heroSubtitle}>{t('focusingOnWhatMatters')}</Text>

            <View style={styles.heroStatsContainer}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>{stats.totalTasks}</Text>
                <Text style={styles.heroStatLabel}>{t('totalTasks')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: "#A8DCD0" }]}>{stats.completedTasks}</Text>
                <Text style={styles.heroStatLabel}>{t('completed')}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={[styles.heroStatValue, { color: "#FBBF24" }]}>{stats.pendingTasks}</Text>
                <Text style={styles.heroStatLabel}>{t('remaining')}</Text>
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
                  <Text style={styles.progressLabel}>{t('completed')}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Focus Today */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, themeStyles.textPrimary]}>{t('focusToday')}</Text>
          <Text style={[styles.sectionSubLink, themeStyles.textSecondary]}>
            {t('tasksRemaining', { count: focusToday.length, plural: focusToday.length !== 1 ? 's' : '' })}
          </Text>
        </View>

        {focusToday.length === 0 ? (
          <View style={[styles.emptyBox, themeStyles.cardBg, styles.cardBorder]}>
            <View style={styles.emptyIconBg}>
              <MaterialIcons name="celebration" size={32} color="#5F806D" />
            </View>
            <Text style={[styles.emptyTextTitle, themeStyles.textPrimary]}>{t('allCaughtUp')}</Text>
            <Text style={[styles.emptyTextSub, themeStyles.textSecondary]}>{t('allCaughtUpDesc')}</Text>
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
                      }}>•</Text>  {task.priority === "HIGH" ? t("highPriority") : task.priority === "MED" ? t("mediumPriority") : t("lowPriority")}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Quick Stats - Bento Grid */}
        <Text style={[styles.sectionTitle, themeStyles.textPrimary, { marginTop: 24, marginBottom: 12 }]}>
          {t('workspaceSummary')}
        </Text>
        <View style={styles.bentoGrid}>
          {/* High Priority */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(239, 68, 68, 0.1)" }]}>
              <MaterialIcons name="priority-high" size={18} color="#EF4444" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.highPriorityCount}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>{t('highPriority')}</Text>
            </View>
          </View>

          {/* Overdue */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(244, 63, 94, 0.1)" }]}>
              <MaterialIcons name="event-busy" size={18} color="#F43F5E" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{stats.missedTasks}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>{t('overdue')}</Text>
            </View>
          </View>

          {/* Active Work Focus */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(6, 182, 212, 0.1)" }]}>
              <MaterialIcons name="business-center" size={18} color="#06B6D4" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{activeWorkCount}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>{t('activeWork')}</Text>
            </View>
          </View>

          {/* Active Study Focus */}
          <View style={[styles.bentoCard, themeStyles.cardBg, styles.cardBorder, { width: "48%" }]}>
            <View style={[styles.bentoIconContainer, { backgroundColor: "rgba(99, 102, 241, 0.1)" }]}>
              <MaterialIcons name="school" size={18} color="#6366F1" />
            </View>
            <View style={styles.bentoTextContainer}>
              <Text style={[styles.bentoNumber, themeStyles.textPrimary]}>{activeStudyCount}</Text>
              <Text style={[styles.bentoLabel, themeStyles.textSecondary]} numberOfLines={1}>{t('activeStudy')}</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, themeStyles.textPrimary, { marginTop: 24, marginBottom: 12 }]}>
          {t('recentActivity')}
        </Text>
        <View style={[styles.activityListContainer, themeStyles.cardBg, styles.cardBorder]}>
          {recentActivity.length === 0 ? (
            <Text style={[styles.emptyActivityText, themeStyles.textSecondary]}>{t('noRecentActivity')}</Text>

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
          repeat: editingTask.repeat,
        } : undefined}
      />

      {/* Confirm Deletion popup */}
      <ConfirmDialog
        visible={deleteTarget !== null}
        title={t('deleteTaskTitle')}
        message={t('deleteTaskConfirm', { title: deleteTarget?.title || '' })}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Task Details Bottom Sheet */}
      <Modal
        visible={showDetail}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetail(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowDetail(false)}
        >
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? "#121A17" : "#FFFFFF" }]}>
            {/* Drag handle */}
            <View style={[styles.dragHandle, { backgroundColor: isDark ? "#2A3631" : "#D1DFD8" }]} />
            
            {detailTarget && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                {/* Header Title */}
                <Text style={[styles.sheetTitle, themeStyles.textPrimary]}>{detailTarget.title}</Text>
                
                {/* Note / Description */}
                <Text style={[styles.sheetLabel, themeStyles.textSecondary]}>{t('descriptionLabel')}</Text>
                <View style={[styles.sheetDescriptionBox, { backgroundColor: isDark ? "#0A100D" : "#F8FAF8", borderColor: isDark ? "#2C3E36" : "#E2E8E4" }]}>
                  <Text style={[styles.sheetDescriptionText, themeStyles.textPrimary]}>
                    {detailTarget.description || t('noDescription')}
                  </Text>
                </View>

                {/* Metadata Grid */}
                <View style={styles.sheetMetaGrid}>
                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>{t('categoryLabel')}</Text>
                    <View style={[styles.sheetBadge, { backgroundColor: isDark ? "#1E2A24" : "#EAF4EE" }]}>
                      <Text style={[styles.sheetBadgeText, { color: isDark ? "#5EEAD4" : "#193C3A" }]}>
                        {detailTarget.category === 'WORK' ? t('workCat') : detailTarget.category === 'STUDY' ? t('studyCat') : t('personalCat')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>{t('priorityLabel')}</Text>
                    <View style={[
                      styles.sheetBadge, 
                      { 
                        backgroundColor: detailTarget.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : detailTarget.priority === 'MED' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' 
                      }
                    ]}>
                      <Text style={[
                        styles.sheetBadgeText, 
                        { color: detailTarget.priority === 'HIGH' ? '#EF4444' : detailTarget.priority === 'MED' ? '#D97706' : '#059669' }
                      ]}>
                        {detailTarget.priority === 'HIGH' ? t('highPri') : detailTarget.priority === 'MED' ? t('medPri') : t('lowPri')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>{t('statusLabel')}</Text>
                    <Pressable 
                      onPress={() => {
                        toggleStatus(detailTarget.id);
                        setDetailTarget(prev => {
                          if (!prev) return null;
                          const nextStatus: TaskStatus = 
                            prev.status === 'TODO' ? 'IN PROGRESS' :
                            prev.status === 'IN PROGRESS' ? 'DONE' : 'TODO';
                          return { ...prev, status: nextStatus };
                        });
                      }}
                      style={[
                        styles.sheetBadge,
                        {
                          backgroundColor: 
                            detailTarget.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 
                            detailTarget.status === 'IN PROGRESS' ? 'rgba(245, 158, 11, 0.1)' : 
                            'rgba(108, 124, 116, 0.1)'
                        }
                      ]}
                    >
                      <Text style={[
                        styles.sheetBadgeText,
                        { 
                          color: 
                            detailTarget.status === 'DONE' ? '#10B981' : 
                            detailTarget.status === 'IN PROGRESS' ? '#D97706' : 
                            '#6B7C72' 
                        }
                      ]}>
                        {detailTarget.status === 'TODO' ? t('toDo') : 
                         detailTarget.status === 'IN PROGRESS' ? t('inProgress') : 
                         t('completedSection')}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>{t('dueDateLabel')}</Text>
                    <Text style={[styles.sheetDateValue, themeStyles.textPrimary]}>
                      {new Date(detailTarget.dueDate).toLocaleDateString(settings.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>

                  {detailTarget.repeat !== 'NONE' && (
                    <View style={styles.sheetMetaRow}>
                      <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>{t('repeatLabel')}</Text>
                      <View style={[
                        styles.sheetBadge,
                        { backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(95, 128, 109, 0.1)" }
                      ]}>
                        <Text style={[
                          styles.sheetBadgeText,
                          { color: isDark ? "#3B82F6" : "#5F806D" }
                        ]}>
                          {detailTarget.repeat === 'DAILY' ? t('dailyRepeat') : detailTarget.repeat === 'WEEKLY' ? t('weeklyRepeat') : t('monthlyRepeat')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Focus Timer Trigger Button */}
                <Pressable
                  style={[styles.focusTimerBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(95, 128, 109, 0.15)' }]}
                  onPress={() => {
                    setShowDetail(false);
                    setActiveFocusTask(detailTarget);
                    setShowFocusTimerModal(true);
                  }}
                >
                  <MaterialIcons name="timer" size={20} color={isDark ? "#3B82F6" : "#5F806D"} />
                  <Text style={[styles.focusTimerBtnText, { color: isDark ? "#3B82F6" : "#5F806D" }]}>
                    {t('startFocusSession')}
                  </Text>
                </Pressable>

                {/* Bottom sheet footer buttons */}
                <View style={styles.sheetActionsRow}>
                  <Pressable 
                    style={[styles.sheetActionBtn, styles.deleteBtn]} 
                    onPress={() => {
                      setShowDetail(false);
                      setDeleteTarget(detailTarget);
                    }}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                    <Text style={styles.deleteBtnText}>{t('delete')}</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.sheetActionBtn, styles.editBtn, { backgroundColor: isDark ? "#10B981" : "#193C3A" }]} 
                    onPress={() => {
                      setShowDetail(false);
                      setEditingTask(detailTarget);
                      setShowForm(true);
                    }}
                  >
                    <MaterialIcons name="edit" size={20} color="#FFFFFF" />
                    <Text style={styles.editBtnText}>{t('editDetails')}</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function getRelativeTime(dateStr: string, t: any): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return t('justNow');
  if (diff < 60) return t('minutesAgo', { count: diff });
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return t('hoursAgo', { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days < 7) return t('daysAgo', { count: days });
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

  // Modal Overlay / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetContent: {
    gap: 16,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  sheetLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  sheetDescriptionBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    minHeight: 80,
  },
  sheetDescriptionText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  sheetMetaGrid: {
    gap: 12,
    marginVertical: 4,
  },
  sheetMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetMetaLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sheetBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  sheetDateValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sheetActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  sheetActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  editBtn: {
    elevation: 2,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  focusTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  focusTimerBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
