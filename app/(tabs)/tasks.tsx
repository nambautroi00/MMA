import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { TaskFormModal } from '@/components/task-form-modal';
import { LiquidHeader } from '@/components/liquid-header';
import { FilterType, Task, TaskCategory, TaskPriority, TaskStatus, formatDate } from '@/constants/data';
import { useApp } from '@/context/app-context';

const filters: FilterType[] = ['All', 'Completed', 'Pending', 'High', 'Study', 'Work', 'Personal'];

export default function TasksScreen() {
  const {
    tasks,
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
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [showSort, setShowSort] = useState(false);

  // Bottom sheet state for details
  const [detailTarget, setDetailTarget] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const isDark = settings.darkMode;

  const handleAdd = (data: { title: string; description: string; category: TaskCategory; priority: TaskPriority; dueDate: string; status: TaskStatus }) => {
    addTask(data);
  };

  const handleEdit = (data: { title: string; description: string; category: TaskCategory; priority: TaskPriority; dueDate: string; status: TaskStatus }) => {
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

  return (
    <SafeAreaView style={[styles.screen, themeStyles.screen]}>
      <LiquidHeader />

      <View style={styles.content}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Search bar row */}
              <View style={styles.searchRow}>
                <View style={[styles.searchBox, themeStyles.inputBg]}>
                  <MaterialIcons name="search" size={20} color={isDark ? "#8F9D97" : "#5F7068"} />
                  <TextInput
                    placeholder="Search tasks..."
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
                  <Text style={[styles.sortTitle, themeStyles.textSecondary]}>Sort by:</Text>
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
                          {opt.label === 'Newest First' ? 'Newest' : opt.label === 'Oldest First' ? 'Oldest' : 'Priority'}
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
                {filters.map((filter) => (
                  <Pressable
                    key={filter}
                    style={[
                      styles.chip,
                      themeStyles.inputBg,
                      activeFilter === filter && (isDark ? styles.chipActiveDark : styles.chipActiveLight),
                      { borderColor: isDark ? "#2C3E36" : "#E6EFEA" }
                    ]}
                    onPress={() => setFilter(filter)}
                  >
                    <Text style={[
                      styles.chipText,
                      activeFilter === filter ? styles.chipTextActive : themeStyles.textSecondary
                    ]}>
                      {filter}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="checklist" size={48} color={isDark ? "#2A3631" : "#BCCFC5"} />
              <Text style={[styles.emptyTitle, themeStyles.textPrimary]}>No tasks found</Text>
              <Text style={[styles.emptyText, themeStyles.textSecondary]}>
                {searchQuery ? 'Try a different search term.' : 'Tap + to create a new task.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
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
                  <Text style={[styles.cardDateRight, themeStyles.textSecondary]}>
                    {formatDate(item.dueDate)}
                  </Text>
                </View>

                {/* Metadata Row */}
                <View style={styles.cardMetaRow}>
                  {/* Category */}
                  <View style={[styles.metaPill, { backgroundColor: isDark ? "#1E2A24" : "#EAF4EE" }]}>
                    <Text style={[styles.metaPillText, { color: isDark ? "#5EEAD4" : "#193C3A" }]}>
                      {item.category === 'WORK' ? 'Work' : item.category === 'STUDY' ? 'Study' : 'Personal'}
                    </Text>
                  </View>

                  {/* Priority indicator */}
                  <Text style={[styles.metaText, themeStyles.textSecondary]}>
                    <Text style={{ 
                      color: item.priority === 'HIGH' ? '#EF4444' : item.priority === 'MED' ? '#F59E0B' : '#10B981',
                      fontSize: 10,
                      fontWeight: '900'
                    }}>•</Text> {item.priority === 'HIGH' ? 'High' : item.priority === 'MED' ? 'Medium' : 'Low'}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>

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
        } : undefined}
      />

      {/* Confirm Deletion popup */}
      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
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
                <Text style={[styles.sheetLabel, themeStyles.textSecondary]}>Description</Text>
                <View style={[styles.sheetDescriptionBox, { backgroundColor: isDark ? "#0A100D" : "#F8FAF8", borderColor: isDark ? "#2C3E36" : "#E2E8E4" }]}>
                  <Text style={[styles.sheetDescriptionText, themeStyles.textPrimary]}>
                    {detailTarget.description || "No description provided."}
                  </Text>
                </View>

                {/* Metadata Grid */}
                <View style={styles.sheetMetaGrid}>
                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>Category</Text>
                    <View style={[styles.sheetBadge, { backgroundColor: isDark ? "#1E2A24" : "#EAF4EE" }]}>
                      <Text style={[styles.sheetBadgeText, { color: isDark ? "#5EEAD4" : "#193C3A" }]}>
                        {detailTarget.category === 'WORK' ? 'Work' : detailTarget.category === 'STUDY' ? 'Study' : 'Personal'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>Priority</Text>
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
                        {detailTarget.priority === 'HIGH' ? 'High' : detailTarget.priority === 'MED' ? 'Medium' : 'Low'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>Status</Text>
                    <Pressable 
                      onPress={() => {
                        toggleStatus(detailTarget.id);
                        setDetailTarget(prev => {
                          if (!prev) return null;
                          const nextStatus: TaskStatus = 
                            prev.status === 'TODO' ? 'IN PROGRESS' :
                            prev.status === 'IN PROGRESS' ? 'REVIEW' :
                            prev.status === 'REVIEW' ? 'DONE' : 'TODO';
                          return { ...prev, status: nextStatus };
                        });
                      }}
                      style={[
                        styles.sheetBadge,
                        {
                          backgroundColor: 
                            detailTarget.status === 'DONE' ? 'rgba(16, 185, 129, 0.1)' : 
                            detailTarget.status === 'REVIEW' ? 'rgba(59, 130, 246, 0.1)' : 
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
                            detailTarget.status === 'REVIEW' ? '#3B82F6' : 
                            detailTarget.status === 'IN PROGRESS' ? '#D97706' : 
                            '#6B7C72' 
                        }
                      ]}>
                        {detailTarget.status === 'TODO' ? 'To Do' : 
                         detailTarget.status === 'IN PROGRESS' ? 'In Progress' : 
                         detailTarget.status === 'REVIEW' ? 'Review' : 
                         'Completed'}
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.sheetMetaRow}>
                    <Text style={[styles.sheetMetaLabel, themeStyles.textSecondary]}>Due Date</Text>
                    <Text style={[styles.sheetDateValue, themeStyles.textPrimary]}>
                      {new Date(detailTarget.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>

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
                    <Text style={styles.deleteBtnText}>Delete</Text>
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
                    <Text style={styles.editBtnText}>Edit Details</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
    marginTop: 10,
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
    paddingVertical: 14,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    height: 38,
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
  list: {
    gap: 12,
    paddingTop: 80,
    paddingBottom: 110,
  },
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
    fontWeight: '600',
  },
  cardTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaPill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
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
});