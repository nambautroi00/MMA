import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal, PanResponder, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { TaskFormModal } from '@/components/task-form-modal';
import { LiquidHeader } from '@/components/liquid-header';
import { FilterType, Task, TaskCategory, TaskPriority, TaskStatus, TaskRepeat } from '@/constants/data';
import { useApp } from '@/context/app-context';

const filters: FilterType[] = ['All', 'High', 'Study', 'Work', 'Personal'];

const filterIcons: Record<FilterType, keyof typeof MaterialIcons.glyphMap> = {
  All: 'list',
  High: 'priority-high',
  Study: 'school',
  Work: 'business-center',
  Personal: 'person',
};


const getRelativeDateLabel = (dateStr: string, isCompleted: boolean, lang: string) => {
  if (isCompleted) {
    return new Date(dateStr).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    if (diffDays === -1) return lang === 'vi' ? "Quá hạn · Hôm qua" : "Overdue · Yesterday";
    return lang === 'vi' ? `Quá hạn · ${Math.abs(diffDays)} ngày trước` : `Overdue · ${Math.abs(diffDays)}d ago`;
  } else if (diffDays === 0) {
    return lang === 'vi' ? "Hôm nay" : "Today";
  } else if (diffDays === 1) {
    return lang === 'vi' ? "Ngày mai" : "Tomorrow";
  } else if (diffDays < 7) {
    return lang === 'vi' ? `Trong ${diffDays} ngày nữa` : `In ${diffDays} days`;
  } else {
    return targetDate.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' });
  }
};

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  isDark: boolean;
}

function SwipeableItem({ children, onDelete, isDark }: SwipeableItemProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const positionRef = useRef(0);
  const startPositionRef = useRef(0);
  const swipeWidth = 70;

  useEffect(() => {
    const id = translateX.addListener((state) => {
      positionRef.current = state.value;
    });
    return () => {
      translateX.removeListener(id);
    };
  }, [translateX]);

  const close = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 8;
      },
      onPanResponderGrant: () => {
        startPositionRef.current = positionRef.current;
      },
      onPanResponderMove: (evt, gestureState) => {
        let newX = startPositionRef.current + gestureState.dx;
        if (newX < -swipeWidth) {
          const overscroll = newX + swipeWidth;
          newX = -swipeWidth + overscroll * 0.2;
        } else if (newX > 0) {
          newX = gestureState.dx * 0.2;
        }
        translateX.setValue(newX);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = -swipeWidth / 2;
        const targetValue = positionRef.current < threshold ? -swipeWidth : 0;

        Animated.spring(translateX, {
          toValue: targetValue,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      }
    })
  ).current;

  return (
    <View style={styles.swipeContainer}>
      {/* Background Actions (Delete button) */}
      <View style={[
        styles.backRow,
        {
          backgroundColor: isDark ? '#281919' : '#FDECEB',
          borderColor: isDark ? 'rgba(255, 239, 239, 0.1)' : 'rgba(239, 68, 68, 0.15)',
        }
      ]}>
        <Pressable
          style={styles.deleteButton}
          onPress={() => {
            close();
            onDelete();
          }}
        >
          <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
        </Pressable>
      </View>

      {/* Foreground Card */}
      <Animated.View
        style={{
          transform: [{ translateX }],
        }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

export default function TasksScreen() {
  const {
    tasks,
    allTasks,
    activeFilter,
    searchQuery,
    sortBy,
    addTask,
    updateTask,
    deleteTask,
    toggleStatus,
    setFilter,
    setSearch,
    setSort,
    settings,
    setActiveFocusTask,
    setShowFocusTimerModal,
    t,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [showSort, setShowSort] = useState(false);

  // Bottom sheet state for details
  const [detailTarget, setDetailTarget] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Collapsed states for the time groupings
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overdue: true,
    today: false,
    upcoming: true,
    completed: true,
  });

  const isDark = settings.darkMode;

  const handleAdd = (data: { title: string; description: string; category: TaskCategory; priority: TaskPriority; dueDate: string; status: TaskStatus; repeat: TaskRepeat }) => {
    addTask(data);
  };

  const handleEdit = (data: { title: string; description: string; category: TaskCategory; priority: TaskPriority; dueDate: string; status: TaskStatus; repeat: TaskRepeat }) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    }
    setEditingTask(null);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const openDetail = (task: Task) => {
    setDetailTarget(task);
    setShowDetail(true);
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Dynamic filter counts
  const filterCounts = useMemo(() => {
    return {
      All: allTasks.length,
      High: allTasks.filter((t) => t.priority === 'HIGH').length,
      Study: allTasks.filter((t) => t.category === 'STUDY').length,
      Work: allTasks.filter((t) => t.category === 'WORK').length,
      Personal: allTasks.filter((t) => t.category === 'PERSONAL').length,
    };
  }, [allTasks]);

  // Grouped tasks by time/completion status
  const groupedTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const dueToday: Task[] = [];
    const upcoming: Task[] = [];
    const completed: Task[] = [];

    tasks.forEach((task) => {
      if (task.status === 'DONE') {
        completed.push(task);
      } else {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() < today.getTime()) {
          overdue.push(task);
        } else if (dueDate.getTime() === today.getTime()) {
          dueToday.push(task);
        } else {
          upcoming.push(task);
        }
      }
    });

    // Sort upcoming tasks by due date ascending
    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return {
      overdue,
      today: dueToday,
      upcoming,
      completed,
    };
  }, [tasks]);

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
    },
    inputBg: {
      backgroundColor: isDark ? "#121A17" : "#FFFFFF",
      borderColor: isDark ? "#1C2A24" : "#E0EAE4",
    }
  };

  const sortOptions = [
    { label: 'Newest First', value: 'newest' as const },
    { label: 'Oldest First', value: 'oldest' as const },
    { label: 'Priority', value: 'priority' as const }
  ];

  // Colors for groups
  const groupColors = {
    overdue: '#EF4444',
    today: isDark ? '#10B981' : '#193C3A',
    upcoming: '#3B82F6',
    completed: '#10B981',
  };

  const renderTaskCard = (item: Task) => {
    // Due date relative text & color
    const isOverdue = !item.status.includes('DONE') && new Date(item.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);
    const dateLabel = getRelativeDateLabel(item.dueDate, item.status === 'DONE', settings.language);
    const dateColor =
      item.status === 'DONE' ? (isDark ? '#5F7068' : '#8F9D97') :
        isOverdue ? '#EF4444' :
          (dateLabel === 'Today' || dateLabel === 'Hôm nay') ? (isDark ? '#10B981' : '#193C3A') : (isDark ? '#8F9D97' : '#5F7068');

    return (
      <SwipeableItem
        key={item.id}
        onDelete={() => setDeleteTarget(item)}
        isDark={isDark}
      >
        <Pressable
          style={[styles.card, themeStyles.cardBg, styles.cardBorder]}
          onPress={() => openDetail(item)}
        >
          {/* Checkbox button */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => toggleStatus(item.id)}
          >
            <View style={[
              styles.checkbox,
              item.status === "DONE" && styles.checkboxChecked,
              item.status === "IN PROGRESS" && { borderColor: isDark ? "#10B981" : "#193C3A" },
              item.status === "TODO" && { borderColor: isDark ? "#3A4D45" : "#AABFB3" }
            ]}>
              {item.status === "DONE" && (
                <MaterialIcons name="check" size={14} color="#FFFFFF" />
              )}
              {item.status === "IN PROGRESS" && (
                <View style={[styles.checkboxProgressDot, { backgroundColor: isDark ? "#10B981" : "#193C3A" }]} />
              )}
            </View>
          </Pressable>

          {/* Card Right details */}
          <View style={styles.cardDetails}>
            <View style={styles.cardTitleRow}>
              <Text style={[
                styles.cardTitle,
                themeStyles.textPrimary,
                item.status === 'DONE' && styles.cardTitleDone
              ]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.cardDateRight, { color: dateColor }]}>
                {dateLabel}
              </Text>
            </View>

            {/* Metadata Row */}
            <View style={styles.cardMetaRow}>
              {/* Category Badge with Icon */}
              <View style={[
                styles.metaPill,
                {
                  backgroundColor:
                    item.category === 'WORK' ? 'rgba(16, 185, 129, 0.1)' :
                      item.category === 'STUDY' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                }
              ]}>
                <MaterialIcons
                  name={item.category === 'WORK' ? 'business-center' : item.category === 'STUDY' ? 'school' : 'person'}
                  size={11}
                  color={
                    item.category === 'WORK' ? (isDark ? '#5EEAD4' : '#193C3A') :
                      item.category === 'STUDY' ? '#3B82F6' : '#D97706'
                  }
                  style={{ marginRight: 3 }}
                />
                <Text style={[
                  styles.metaPillText,
                  {
                    color:
                      item.category === 'WORK' ? (isDark ? '#5EEAD4' : '#193C3A') :
                        item.category === 'STUDY' ? '#3B82F6' : '#D97706'
                  }
                ]}>
                  {item.category === 'WORK' ? t('workCat') : item.category === 'STUDY' ? t('studyCat') : t('personalCat')}
                </Text>
              </View>

              {/* Priority text */}
              <Text style={[styles.metaText, themeStyles.textSecondary]}>
                <Text style={{
                  color: item.priority === 'HIGH' ? '#EF4444' : item.priority === 'MED' ? '#F59E0B' : '#10B981',
                  fontSize: 10,
                  fontWeight: '900'
                }}>•</Text> {item.priority === 'HIGH' ? t('highPri') : item.priority === 'MED' ? t('medPri') : t('lowPri')}
              </Text>

              {/* Repeat loop icon if recurring */}
              {item.repeat && item.repeat !== 'NONE' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <MaterialIcons name="autorenew" size={13} color={isDark ? "#3B82F6" : "#5F806D"} />
                  <Text style={[styles.metaText, { color: isDark ? "#3B82F6" : "#5F806D", fontSize: 11 }]}>
                    {item.repeat === 'DAILY' ? t('dailyRepeat') : item.repeat === 'WEEKLY' ? t('weeklyRepeat') : t('monthlyRepeat')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </SwipeableItem>
    );
  };

  const renderSection = (
    key: 'overdue' | 'today' | 'upcoming' | 'completed',
    title: string,
    items: Task[],
    headerColor: string,
    emptyMessage: string
  ) => {
    const isCollapsed = collapsedGroups[key];
    const count = items.length;

    // Only render the section if there are items, or if it's "Today"
    if (count === 0 && key !== 'today') {
      return null;
    }

    return (
      <View style={styles.sectionContainer} key={key}>
        <Pressable
          style={[
            styles.sectionHeader,
            themeStyles.cardBg,
            styles.cardBorder,
            { borderLeftColor: headerColor, borderLeftWidth: 4 }
          ]}
          onPress={() => toggleGroup(key)}
        >
          <View style={styles.sectionHeaderLeft}>
            <MaterialIcons
              name={isCollapsed ? "keyboard-arrow-right" : "keyboard-arrow-down"}
              size={22}
              color={isDark ? "#8F9D97" : "#5F7068"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.sectionHeaderText, themeStyles.textPrimary]}>{title}</Text>
            <View style={[styles.sectionCountBadge, { backgroundColor: isDark ? "#1E2A24" : "#EAF4EE" }]}>
              <Text style={[styles.sectionCountText, { color: isDark ? "#5EEAD4" : "#193C3A" }]}>{count}</Text>
            </View>
          </View>
        </Pressable>

        {!isCollapsed && (
          <View style={styles.sectionContent}>
            {count === 0 ? (
              <View style={[styles.emptySectionBox, themeStyles.cardBg, styles.cardBorder]}>
                <Text style={[styles.emptySectionText, themeStyles.textSecondary]}>{emptyMessage}</Text>
              </View>
            ) : (
              items.map((item) => renderTaskCard(item))
            )}
          </View>
        )}
      </View>
    );
  };

  const hasAnyTasks = tasks.length > 0;

  return (
    <SafeAreaView style={[styles.screen, themeStyles.screen]}>
      <LiquidHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar row */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, themeStyles.inputBg]}>
            <MaterialIcons name="search" size={20} color={isDark ? "#8F9D97" : "#5F7068"} />
            <TextInput
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={isDark ? "#5F7068" : "#A2AEA8"}
              style={[styles.searchInput, themeStyles.textPrimary]}
              value={searchQuery}
              onChangeText={setSearch}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <MaterialIcons name="close" size={18} color={isDark ? "#8F9D97" : "#5F7068"} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[styles.tuneButton, themeStyles.inputBg, showSort && styles.tuneButtonActive]}
            onPress={() => setShowSort(!showSort)}
          >
            <MaterialIcons name="sort" size={22} color={showSort ? "#FFFFFF" : (isDark ? "#8F9D97" : "#5F7068")} />
          </Pressable>
        </View>

        {/* Inline Sort Options Drawer */}
        {showSort && (
          <View style={[styles.sortDrawer, themeStyles.inputBg]}>
            {/* Sort options */}
            <Text style={[styles.sortTitle, themeStyles.textSecondary]}>{t('sortBy')}</Text>
            <View style={styles.sortOptionsRow}>
              {sortOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.sortOptionChip,
                    sortBy === opt.value && (isDark ? styles.sortOptionChipActiveDark : styles.sortOptionChipActiveLight),
                    { borderColor: isDark ? "#2A3631" : "#E2EAE4" }
                  ]}
                  onPress={() => setSort(opt.value)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === opt.value ? styles.sortOptionTextActive : themeStyles.textSecondary
                  ]}>
                    {opt.value === 'newest' ? t('newest') : opt.value === 'oldest' ? t('oldest') : t('priority')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Filter horizontal scroll */}
        <ScrollView
          contentContainerStyle={styles.chipRow}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => {
            const count = filterCounts[filter];
            const isActive = activeFilter === filter;
            const iconName = filterIcons[filter];

            return (
              <Pressable
                key={filter}
                style={[
                  styles.chip,
                  themeStyles.inputBg,
                  isActive && (isDark ? styles.chipActiveDark : styles.chipActiveLight),
                  { borderColor: isDark ? "#2C3E36" : "#E6EFEA" }
                ]}
                onPress={() => setFilter(filter)}
              >
                <MaterialIcons
                  name={iconName}
                  size={14}
                  color={isActive ? '#FFFFFF' : (isDark ? '#8F9D97' : '#5F7068')}
                  style={{ marginRight: 4 }}
                />
                <Text style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : themeStyles.textSecondary
                ]}>
                  {filter === 'All' ? t('all') : filter === 'High' ? t('highPri') : filter === 'Study' ? t('studyCat') : filter === 'Work' ? t('workCat') : t('personalCat')} {count > 0 ? `· ${count}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Task Groups (Overdue, Today, Upcoming, Completed) */}
        {hasAnyTasks ? (
          <View style={styles.sectionsWrapper}>
            {renderSection('overdue', t('overdueSection'), groupedTasks.overdue, groupColors.overdue, t('noOverdue'))}
            {renderSection('today', t('dueTodaySection'), groupedTasks.today, groupColors.today, t('allCaughtUpToday'))}
            {renderSection('upcoming', t('upcomingSection'), groupedTasks.upcoming, groupColors.upcoming, t('noUpcoming'))}
            {renderSection('completed', t('completedSection'), groupedTasks.completed, groupColors.completed, t('noCompleted'))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="checklist" size={48} color={isDark ? "#2A3631" : "#BCCFC5"} />
            <Text style={[styles.emptyTitle, themeStyles.textPrimary]}>{t('noTasksFound')}</Text>
            <Text style={[styles.emptyText, themeStyles.textSecondary]}>
              {searchQuery ? t('tryDifferentSearch') : t('tapPlusToCreate')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB to create task */}
      <Pressable
        style={[styles.fab, { backgroundColor: isDark ? "#10B981" : "#193C3A" }]}
        onPress={() => { setEditingTask(null); setShowForm(true); }}
      >
        <MaterialIcons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      {/* Task Creation/Editing Modal */}
      <TaskFormModal
        visible={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null); }}
        onSubmit={editingTask ? handleEdit : handleAdd}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 84,
    paddingBottom: 110,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  searchBox: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tuneButton: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  tuneButtonActive: {
    backgroundColor: '#193C3A',
    borderColor: '#193C3A',
  },
  sortDrawer: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  sortTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sortOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOptionChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  sortOptionChipActiveLight: {
    backgroundColor: '#193C3A',
    borderColor: '#193C3A',
  },
  sortOptionChipActiveDark: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  sortOptionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortOptionTextActive: {
    color: '#FFFFFF',
  },
  chipRow: {
    gap: 8,
    paddingVertical: 10,
    marginBottom: 10,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  chipActiveLight: {
    backgroundColor: '#193C3A',
    borderColor: '#193C3A',
  },
  chipActiveDark: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Accordion Sections
  sectionsWrapper: {
    gap: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 8,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionContent: {
    gap: 10,
    paddingLeft: 6,
    paddingRight: 6,
  },
  emptySectionBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySectionText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Task Cards
  card: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardBorder: {
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  checkboxContainer: {
    paddingRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
    flex: 1,
    marginRight: 10,
  },
  cardDateRight: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  metaPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaPillText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State general
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 4,
  },

  // FAB
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 84,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000000',
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
  swipeContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  backRow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 70,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});