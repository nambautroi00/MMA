import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TaskCategory, TaskPriority, TaskStatus } from '@/constants/data';
import { useApp } from '@/context/app-context';

interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
}

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TaskFormData, 'id' | 'createdAt'>) => void;
  initialData?: TaskFormData;
}

const defaultForm: TaskFormData = {
  title: '',
  description: '',
  category: 'WORK',
  priority: 'MED',
  dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'TODO',
};

const priorities: { label: string; value: TaskPriority; color: string }[] = [
  { label: 'High', value: 'HIGH', color: '#D94F45' },
  { label: 'Medium', value: 'MED', color: '#E6A23C' },
  { label: 'Low', value: 'LOW', color: '#6FA77D' },
];

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days: (Date | null)[] = [];

  let dayOfWeek = date.getDay();
  // Adjust so Monday is 0, Tuesday is 1, ..., Sunday is 6
  dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  for (let i = 0; i < dayOfWeek; i++) {
    days.push(null);
  }

  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export function TaskFormModal({ visible, onClose, onSubmit, initialData }: TaskFormModalProps) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  const [form, setForm] = useState<TaskFormData>(initialData || { ...defaultForm });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Sync initialData when modal opens or editing changes
  useEffect(() => {
    if (visible) {
      const activeDate = initialData ? new Date(initialData.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      setForm(initialData || { ...defaultForm });
      setCurrentMonth(isNaN(activeDate.getTime()) ? new Date() : activeDate);
    }
  }, [visible, initialData]);

  const handleClose = () => {
    setForm(initialData || { ...defaultForm });
    onClose();
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      dueDate: new Date(form.dueDate).toISOString(),
      status: form.status,
    });
    setForm({ ...defaultForm });
    onClose();
  };

  const handlePrevMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayDate: Date) => {
    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    setForm((f) => ({ ...f, dueDate: `${yyyy}-${mm}-${dd}` }));
    setShowDatePicker(false);
  };

  const categories: { label: string; value: TaskCategory; color: string }[] = [
    { label: 'Work', value: 'WORK', color: isDark ? '#10B981' : '#7CA086' },
    { label: 'Study', value: 'STUDY', color: isDark ? '#3B82F6' : '#6D927F' },
    { label: 'Personal', value: 'PERSONAL', color: isDark ? '#F59E0B' : '#D4A574' },
  ];

  const isValid = form.title.trim().length > 0;
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.screen, { backgroundColor: isDark ? '#0A100D' : '#F4F8F6' }]}
      >
        <View style={[styles.header, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderBottomColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <MaterialIcons name="close" size={24} color={isDark ? '#8F9D97' : '#6D8D7D'} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: isDark ? '#EBF1EE' : '#26302B' }]}>
            {initialData ? 'Edit Task' : 'New Task'}
          </Text>
          <Pressable
            onPress={handleSubmit}
            style={[
              styles.headerButton,
              styles.saveButton,
              { backgroundColor: isValid ? (isDark ? '#10B981' : '#5F806D') : (isDark ? '#1C2E26' : '#C4D4CB') }
            ]}
            disabled={!isValid}
          >
            <MaterialIcons name="check" size={24} color={isValid ? '#FFFFFF' : (isDark ? '#5A6C62' : '#AABDB5')} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', color: isDark ? '#EBF1EE' : '#34433C', borderColor: isDark ? '#1C2A24' : '#E2EFEA' }]}
            value={form.title}
            onChangeText={(text) => setForm((f) => ({ ...f, title: text }))}
            placeholder="Task title"
            placeholderTextColor={isDark ? '#5C6F65' : '#A2AEA8'}
          />

          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: isDark ? '#121A17' : '#FFFFFF', color: isDark ? '#EBF1EE' : '#34433C', borderColor: isDark ? '#1C2A24' : '#E2EFEA' }
            ]}
            value={form.description}
            onChangeText={(text) => setForm((f) => ({ ...f, description: text }))}
            placeholder="Add description..."
            placeholderTextColor={isDark ? '#5C6F65' : '#A2AEA8'}
            multiline
          />

          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => {
              const active = form.category === cat.value;
              return (
                <Pressable
                  key={cat.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? cat.color : (isDark ? '#121A17' : '#FFFFFF'),
                      borderColor: active ? cat.color : (isDark ? '#1C2A24' : '#DEE8E1'),
                    }
                  ]}
                  onPress={() => setForm((f) => ({ ...f, category: cat.value }))}
                >
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : (isDark ? '#8F9D97' : '#7C8B83') }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Priority</Text>
          <View style={styles.chipRow}>
            {priorities.map((pri) => {
              const active = form.priority === pri.value;
              return (
                <Pressable
                  key={pri.value}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? pri.color : (isDark ? '#121A17' : '#FFFFFF'),
                      borderColor: active ? pri.color : (isDark ? '#1C2A24' : '#DEE8E1'),
                    }
                  ]}
                  onPress={() => setForm((f) => ({ ...f, priority: pri.value }))}
                >
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : (isDark ? '#8F9D97' : '#7C8B83') }]}>
                    {pri.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Due Date</Text>
          <Pressable
            style={[styles.inputContainer, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1C2A24' : '#E2EFEA' }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="today" size={20} color={isDark ? '#8F9D97' : '#6D8D7D'} style={styles.inputIcon} />
            <Text style={[styles.inputFieldText, { color: isDark ? '#EBF1EE' : '#34433C' }]}>
              {form.dueDate}
            </Text>
          </Pressable>

          <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>Status</Text>
          <View style={styles.chipRow}>
            {(['TODO', 'IN PROGRESS',] as TaskStatus[]).map((status) => {
              const active = form.status === status;
              const activeColor =
                status === 'IN PROGRESS' ? '#E6A23C' :
                  (isDark ? '#4B5563' : '#8A9BA8');
              return (
                <Pressable
                  key={status}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? activeColor : (isDark ? '#121A17' : '#FFFFFF'),
                      borderColor: active ? activeColor : (isDark ? '#1C2A24' : '#DEE8E1'),
                    }
                  ]}
                  onPress={() => setForm((f) => ({ ...f, status }))}
                >
                  <Text style={[styles.chipText, { color: active ? '#FFFFFF' : (isDark ? '#8F9D97' : '#7C8B83') }]}>
                    {status === 'TODO' ? 'To Do' :
                      status === 'IN PROGRESS' ? 'In Progress' :
                        ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Calendar Date Picker Sub-Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.calendarOverlay} onPress={() => setShowDatePicker(false)}>
          <View style={[styles.calendarBox, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
            {/* Header: Prev, Month/Year, Next */}
            <View style={styles.calendarHeader}>
              <Pressable onPress={handlePrevMonth} style={styles.calendarNavBtn}>
                <MaterialIcons name="chevron-left" size={24} color={isDark ? '#EBF1EE' : '#26302B'} style={styles.navIcon} />
              </Pressable>
              <Text style={[styles.calendarMonthText, { color: isDark ? '#EBF1EE' : '#26302B' }]}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable onPress={handleNextMonth} style={styles.calendarNavBtn}>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#EBF1EE' : '#26302B'} style={styles.navIcon} />
              </Pressable>
            </View>

            {/* Days of week header */}
            <View style={styles.weekDaysRow}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <Text key={idx} style={[styles.weekDayLabel, { color: isDark ? '#5C6F65' : '#8A9991' }]}>{day}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {getDaysInMonth(year, month).map((day, idx) => {
                if (!day) {
                  return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                }
                const formattedDay = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                const isSelected = form.dueDate === formattedDay;
                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: isDark ? '#10B981' : '#5F806D' }
                    ]}
                    onPress={() => handleSelectDay(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: isSelected ? '#FFFFFF' : (isDark ? '#EBF1EE' : '#26302B') }
                    ]}>
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  saveButton: {
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    height: 50,
    paddingHorizontal: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputFieldText: {
    fontSize: 15,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 22,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  // Calendar styles
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBox: {
    width: 320,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIcon: {
    alignSelf: 'center',
  },
  calendarMonthText: {
    fontSize: 16,
    fontWeight: '800',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 6,
  },
  weekDayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
    marginVertical: 1,
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 38,
    marginVertical: 1,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
  },
});