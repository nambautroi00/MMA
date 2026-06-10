import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '@/context/app-context';

const ITEM_HEIGHT = 44;

interface ScrollWheelProps {
  items: number[];
  selectedValue: number;
  onValueChange: (val: number) => void;
  suffix: string;
  isDark: boolean;
  visible: boolean;
}

function ScrollWheel({
  items,
  selectedValue,
  onValueChange,
  suffix,
  isDark,
  visible,
}: ScrollWheelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [localSelected, setLocalSelected] = useState(selectedValue);

  // Sync scroll position when visible changes or value updates from parent
  useEffect(() => {
    if (visible) {
      const index = items.indexOf(selectedValue);
      if (index !== -1) {
        const timer = setTimeout(() => {
          scrollRef.current?.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false,
          });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, selectedValue, items]);

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      setLocalSelected(items[index]);
      onValueChange(items[index]);
    }
  };

  return (
    <View style={styles.wheelCol}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={styles.wheelContent}
      >
        {/* Top Spacers */}
        <View style={styles.wheelSpacer} />
        <View style={styles.wheelSpacer} />

        {items.map((val) => {
          const isActive = val === localSelected;
          return (
            <View key={val} style={styles.wheelItem}>
              <Text
                style={[
                  styles.wheelText,
                  isActive
                    ? [styles.wheelTextActive, { color: isDark ? '#FFFFFF' : '#192420' }]
                    : { color: isDark ? '#5F7068' : '#A2AEA8' },
                ]}
              >
                {val} <Text style={styles.wheelSuffix}>{suffix}</Text>
              </Text>
            </View>
          );
        })}

        {/* Bottom Spacers */}
        <View style={styles.wheelSpacer} />
        <View style={styles.wheelSpacer} />
      </ScrollView>
    </View>
  );
}

export function FocusTimerModal() {
  const {
    activeFocusTask: task,
    focusSecondsRemaining: secondsRemaining,
    isFocusTimerActive: isActive,
    isFocusTimerStarted: isTimerStarted,
    isFocusTimerCompleted: isCompleted,
    showFocusTimerModal: visible,
    startFocusTimer,
    pauseFocusTimer,
    resumeFocusTimer,
    stopFocusTimer,
    completeFocusTask,
    setShowFocusTimerModal,
    settings,
    t,
  } = useApp();

  const isDark = settings.darkMode;

  // Custom picker duration state
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [customSeconds, setCustomSeconds] = useState(0);

  // Sync picker inputs when task changes or modal opens
  useEffect(() => {
    if (task && !isTimerStarted) {
      setCustomHours(0);
      setCustomMinutes(25);
      setCustomSeconds(0);
    }
  }, [task, isTimerStarted, visible]);

  // Pulsing animation for active countdown text
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isActive, pulseAnim]);

  if (!task) return null;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleActive = () => {
    if (isActive) {
      pauseFocusTimer();
    } else {
      resumeFocusTimer();
    }
  };

  const handleReset = () => {
    stopFocusTimer();
  };

  const handleStartTimer = () => {
    const totalSec = customHours * 3600 + customMinutes * 60 + customSeconds;
    if (totalSec > 0) {
      startFocusTimer(task, totalSec);
    } else {
      startFocusTimer(task, 25 * 60);
    }
  };

  const handleCompleteEarly = () => {
    completeFocusTask();
    setShowFocusTimerModal(false);
  };

  // Dynamic theme colors
  const colors = {
    overlay: isDark ? 'rgba(5, 10, 8, 0.95)' : 'rgba(240, 245, 242, 0.96)',
    textPrimary: isDark ? '#EBF1EE' : '#192420',
    textSecondary: isDark ? '#8F9D97' : '#5F7068',
    cardBg: isDark ? '#121A17' : '#FFFFFF',
    border: isDark ? '#1C2A24' : '#DEE8E1',
    activeTint: isDark ? '#10B981' : '#193C3A',
    pulseTint: isDark ? '#3B82F6' : '#5F806D',
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFocusTimerModal(false)}
    >
      <View style={[styles.container, { backgroundColor: colors.overlay }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.closeBtn} onPress={() => setShowFocusTimerModal(false)}>
            <MaterialIcons name="close" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('focusMode')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Task Title */}
        <View style={styles.taskContainer}>
          <View style={[styles.categoryPill, { backgroundColor: isDark ? '#1E2A24' : '#EAF4EE' }]}>
            <Text style={[styles.categoryText, { color: isDark ? '#5EEAD4' : '#193C3A' }]}>
              {task.category === 'WORK' ? t('workCat') : task.category === 'STUDY' ? t('studyCat') : t('personalCat')}
            </Text>
          </View>
          <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{task.title}</Text>
          {task.description ? (
            <Text style={[styles.taskDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}
        </View>

        {/* Main Countdown or Custom Picker Display */}
        <View style={styles.timerWrapper}>
          {!isTimerStarted ? (
            <View style={[styles.pickerBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              {/* Highlight capsule in center */}
              <View
                style={[
                  styles.highlightBar,
                  { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(95, 128, 109, 0.08)' },
                ]}
                pointerEvents="none"
              />

              <View style={styles.pickerContainer}>
                <ScrollWheel
                  items={Array.from({ length: 13 }, (_, i) => i)}
                  selectedValue={customHours}
                  onValueChange={setCustomHours}
                  suffix={t('hoursSuffix')}
                  isDark={isDark}
                  visible={!isTimerStarted}
                />
                <ScrollWheel
                  items={Array.from({ length: 60 }, (_, i) => i)}
                  selectedValue={customMinutes}
                  onValueChange={setCustomMinutes}
                  suffix={t('minutesSuffix')}
                  isDark={isDark}
                  visible={!isTimerStarted}
                />
                <ScrollWheel
                  items={Array.from({ length: 60 }, (_, i) => i)}
                  selectedValue={customSeconds}
                  onValueChange={setCustomSeconds}
                  suffix={t('secondsSuffix')}
                  isDark={isDark}
                  visible={!isTimerStarted}
                />
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.timerRing,
                {
                  borderColor: isCompleted
                    ? '#10B981'
                    : isActive
                    ? colors.pulseTint
                    : colors.border,
                  shadowColor: isActive ? colors.pulseTint : 'transparent',
                },
              ]}
            >
              {isCompleted ? (
                <View style={styles.celebrationWrapper}>
                  <MaterialIcons name="celebration" size={48} color="#10B981" />
                  <Text style={[styles.celebrationTitle, { color: colors.textPrimary }]}>{t('wellDone')}</Text>
                  <Text style={[styles.celebrationSub, { color: colors.textSecondary }]}>
                    {t('focusSessionCompleted')}
                  </Text>
                </View>
              ) : (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Text
                    style={[
                      styles.timerText,
                      {
                        color: isActive ? colors.pulseTint : colors.textPrimary,
                        fontVariant: ['tabular-nums'],
                      },
                    ]}
                  >
                    {formatTime(secondsRemaining)}
                  </Text>
                </Animated.View>
              )}
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsWrapper}>
          {!isTimerStarted ? (
            <Pressable
              style={[styles.startBtn, { backgroundColor: isDark ? '#3B82F6' : '#5F806D' }]}
              onPress={handleStartTimer}
            >
              <MaterialIcons name="play-arrow" size={24} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{t('startFocusSession')}</Text>
            </Pressable>
          ) : isCompleted ? (
            <Pressable
              style={[styles.startBtn, { backgroundColor: '#10B981' }]}
              onPress={handleCompleteEarly}
            >
              <MaterialIcons name="done-all" size={22} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>{t('completeTask')}</Text>
            </Pressable>
          ) : (
            <View style={styles.controlButtonsRow}>
              <Pressable
                style={[styles.circleControlBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                onPress={handleReset}
              >
                <MaterialIcons name="stop" size={24} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                style={[
                  styles.circleControlBtn,
                  styles.playPauseBtn,
                  { backgroundColor: isActive ? '#EF4444' : '#10B981' },
                ]}
                onPress={handleToggleActive}
              >
                <MaterialIcons
                  name={isActive ? 'pause' : 'play-arrow'}
                  size={30}
                  color="#FFFFFF"
                />
              </Pressable>

              <Pressable
                style={[
                  styles.circleControlBtn,
                  styles.playPauseBtn,
                  { backgroundColor: colors.activeTint },
                ]}
                onPress={handleCompleteEarly}
              >
                <MaterialIcons name="check" size={30} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  categoryPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  taskDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  timerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  timerText: {
    fontSize: 60,
    fontWeight: '200',
    letterSpacing: -1,
  },
  celebrationWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  celebrationSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  controlButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  circleControlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    borderWidth: 0,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  startBtn: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Custom Time Picker Styles
  pickerBox: {
    width: 280,
    height: 250,
    borderRadius: 24,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  highlightBar: {
    height: ITEM_HEIGHT,
    borderRadius: 12,
    position: 'absolute',
    left: 12,
    right: 12,
    alignSelf: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: ITEM_HEIGHT * 5,
    paddingHorizontal: 12,
  },
  wheelCol: {
    flex: 1,
    height: ITEM_HEIGHT * 5,
  },
  wheelContent: {
    alignItems: 'center',
  },
  wheelSpacer: {
    height: ITEM_HEIGHT,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelText: {
    fontSize: 15,
    fontWeight: '400',
  },
  wheelTextActive: {
    fontSize: 17,
    fontWeight: '800',
  },
  wheelSuffix: {
    fontSize: 10,
    fontWeight: '400',
  },
});
