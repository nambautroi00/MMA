import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState, useEffect, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { LiquidHeader } from '@/components/liquid-header';
import { useApp } from '@/context/app-context';
import { ActivityLog } from '@/hooks/use-tasks';

export default function SettingsScreen() {
  const { settings, toggleDarkMode, toggleFluidAnimations, stats, activityLog, setLanguage, t } = useApp();
  const isDark = settings.darkMode;
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: isDark ? '#0A100D' : '#F4F8F6' }]}>
      <LiquidHeader />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          style={[styles.profileCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}
          onPress={() => setShowEditProfile(true)}
        >
          {settings.profileAvatar ? (
            <Image source={{ uri: settings.profileAvatar }} style={[styles.profileAvatar, { borderColor: isDark ? '#1A2520' : '#D3E7DB' }]} />
          ) : (
            <Image source={require('@/assets/images/user.jpg')} style={[styles.profileAvatar, { borderColor: isDark ? '#1A2520' : '#D3E7DB' }]} />
          )}
          <View style={styles.profileText}>
            <Text style={[styles.name, { color: isDark ? '#EBF1EE' : '#26302B' }]}>{settings.profileName}</Text>
            <Text style={[styles.role, { color: isDark ? '#8F9D97' : '#5C6F65' }]}>
              {t('profileRole', { role: settings.profileRole, count: stats.totalTasks })}
            </Text>
          </View>
          <MaterialIcons name="edit" size={18} color={isDark ? '#8F9D97' : '#6D8D7D'} style={{ marginRight: 4 }} />
        </Pressable>

        <Label text={t('appearance')} isDark={isDark} />
        <View style={[styles.group, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <SettingRow
            icon={isDark ? 'dark-mode' : 'light-mode'}
            label={t('darkMode')}
            right={<Toggle active={isDark} onPress={toggleDarkMode} />}
          />
          <SettingRow
            icon="blur-on"
            label={t('animations')}
            right={<Toggle active={settings.fluidAnimations} onPress={toggleFluidAnimations} />}
          />
          <SettingRow
            icon="translate"
            label={t('language')}
            right={
              <View style={[styles.languageToggleContainer, { backgroundColor: isDark ? '#2C3E36' : '#DDE9E2' }]}>
                <Pressable
                  style={[
                    styles.langBtn,
                    settings.language === 'en' && { backgroundColor: isDark ? '#10B981' : '#5F806D' }
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[styles.langBtnText, settings.language === 'en' && { color: '#FFFFFF' }]}>EN</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.langBtn,
                    settings.language === 'vi' && { backgroundColor: isDark ? '#10B981' : '#5F806D' }
                  ]}
                  onPress={() => setLanguage('vi')}
                >
                  <Text style={[styles.langBtnText, settings.language === 'vi' && { color: '#FFFFFF' }]}>VI</Text>
                </Pressable>
              </View>
            }
          />
        </View>

        <Label text={t('about')} isDark={isDark} />
        <View style={[styles.group, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
          <SettingRow icon="info-outline" label={t('version')} value="2.4.0" />
          <SettingRow icon="person-outline" label={t('developer')} value="Nam" />
        </View>

        <View style={styles.activityHeader}>
          <Text style={[styles.recentTitle, { color: isDark ? '#EBF1EE' : '#0B1712' }]}>{t('activityLog')}</Text>
        </View>

        <View style={styles.activityList}>
          {activityLog.length === 0 ? (
            <View style={[styles.activityCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
              <Text style={[styles.activityTitle, { color: isDark ? '#8F9D97' : '#5A6761' }]}>{t('noActivityLogs')}</Text>
            </View>
          ) : (
            activityLog.slice(0, 5).map((log) => {
              const details = getActivityDetails(log, isDark, t);
              return (
                <View key={log.id} style={[styles.activityCard, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1A2520' : '#EAF0EC' }]}>
                  <View style={[styles.activityIcon, { backgroundColor: details.bg }]}>
                    <MaterialIcons
                      name={details.icon as keyof typeof MaterialIcons.glyphMap}
                      size={16}
                      color={details.color}
                    />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityTitle, { color: isDark ? '#EBF1EE' : '#43524B' }]} numberOfLines={1}>{details.title}</Text>
                    <Text style={[styles.activityTime, { color: isDark ? '#8F9D97' : '#778A80' }]}>{getRelativeTime(log.timestamp, t)}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#5A6C62' : '#8A9991' }]}>Assignment 1 - Task Management App</Text>
          <Text style={[styles.footerSub, { color: isDark ? '#4D5D54' : '#A0ADA6' }]}>Built with React Native + Expo Router</Text>
        </View>
      </ScrollView>

      <ProfileEditModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

function Label({ text, isDark }: { text: string; isDark: boolean }) {
  return <Text style={[styles.label, { color: isDark ? '#6B7C72' : '#8C9E95' }]}>{text}</Text>;
}

function SettingRow({
  icon,
  label,
  value,
  chevron,
  right,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value?: string;
  chevron?: boolean;
  right?: ReactNode;
}) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  return (
    <View style={[styles.row, { borderBottomColor: isDark ? '#1D2823' : '#F0F5F2' }]}>
      <View style={styles.rowLeft}>
        <MaterialIcons name={icon} size={18} color={isDark ? '#8F9D97' : '#6D8D7D'} />
        <Text style={[styles.rowLabel, { color: isDark ? '#EBF1EE' : '#43524B' }]}>{label}</Text>
      </View>
      {value ? <Text style={[styles.rowValue, { color: isDark ? '#8F9D97' : '#50635A' }]}>{value}</Text> : null}
      {right}
      {chevron ? <MaterialIcons name="chevron-right" size={20} color={isDark ? '#5A6C63' : '#789086'} /> : null}
    </View>
  );
}

function Toggle({ active, onPress }: { active: boolean; onPress: () => void }) {
  const { settings } = useApp();
  const isDark = settings.darkMode;

  return (
    <Pressable
      style={[
        styles.toggle,
        { backgroundColor: active ? (isDark ? '#10B981' : '#5F806D') : (isDark ? '#2C3E36' : '#DDE9E2') }
      ]}
      onPress={onPress}
    >
      <View style={[styles.toggleKnob, active && styles.toggleKnobActive]} />
    </Pressable>
  );
}

function getActivityDetails(log: ActivityLog, isDark: boolean, t: any) {
  switch (log.type) {
    case 'CREATE':
      return {
        title: t('activityCreated', { title: log.taskTitle }),
        icon: 'add-circle-outline',
        color: '#3B82F6',
        bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
      };
    case 'UPDATE':
      return {
        title: t('activityUpdated', { title: log.taskTitle }),
        icon: 'edit',
        color: '#F59E0B',
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
      };
    case 'COMPLETE':
      return {
        title: t('activityCompleted', { title: log.taskTitle }),
        icon: 'check-circle-outline',
        color: '#10B981',
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
      };
    case 'DELETE':
      return {
        title: t('activityDeleted', { title: log.taskTitle }),
        icon: 'delete-outline',
        color: '#EF4444',
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
      };
    default:
      return {
        title: t('activityAction', { title: log.taskTitle }),
        icon: 'info-outline',
        color: '#8A9BA8',
        bg: isDark ? 'rgba(138, 155, 168, 0.15)' : 'rgba(138, 155, 168, 0.08)',
      };
  }
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
    padding: 18,
    paddingTop: 84,
    paddingBottom: 104,
  },
  profileCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    padding: 17,
  },
  profileAvatar: {
    borderRadius: 31,
    borderWidth: 3,
    height: 62,
    width: 62,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
  },
  role: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
    marginBottom: 7,
    marginTop: 18,
    textTransform: 'uppercase',
  },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowValue: {
    fontSize: 13,
    maxWidth: 140,
    textAlign: 'right',
    fontWeight: '700',
  },
  toggle: {
    alignItems: 'flex-start',
    borderRadius: 11,
    height: 22,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 42,
  },
  toggleKnob: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  activityHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  activityList: {
    gap: 9,
    marginTop: 10,
  },
  activityCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    padding: 13,
  },
  activityIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  activityTime: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerSub: {
    fontSize: 11,
    marginTop: 3,
  },
  languageToggleContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7C8B83',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalContent: {
    padding: 20,
    paddingBottom: 24,
  },
  modalLabel: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    height: 50,
    paddingHorizontal: 16,
  },
  modalErrorText: {
    color: '#D94F45',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  modalAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatarWrapper: {
    height: 100,
    width: 100,
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
  },
  modalAvatarPreview: {
    width: '100%',
    height: '100%',
  },
  modalAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalAvatarSub: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  modalFooterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalBtnSave: {},
  modalBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

function ProfileEditModal({ visible, onClose, isDark }: ProfileEditModalProps) {
  const { settings, updateProfile, t } = useApp();
  const [name, setName] = useState(settings.profileName);
  const [avatar, setAvatar] = useState(settings.profileAvatar);
  
  useEffect(() => {
    if (visible) {
      setName(settings.profileName);
      setAvatar(settings.profileAvatar);
    }
  }, [visible, settings.profileName, settings.profileAvatar]);

  const isValid = name.trim().length > 0;

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('warning'), t('permissionRequired'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    updateProfile(name.trim(), settings.profileRole, avatar.trim());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={{ width: '100%', maxWidth: 340 }} onPress={(e) => e.stopPropagation()}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContainer, { backgroundColor: isDark ? '#121A17' : '#FFFFFF', borderColor: isDark ? '#1D2823' : '#EAF0EC' }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#1D2823' : '#F0F5F2' }]}>
              <Text style={[styles.modalHeaderTitle, { color: isDark ? '#EBF1EE' : '#26302B' }]}>
                {t('editProfile')}
              </Text>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalAvatarContainer}>
                <Pressable onPress={pickImage} style={[styles.modalAvatarWrapper, { borderColor: isDark ? '#1A2520' : '#D3E7DB' }]}>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.modalAvatarPreview} />
                  ) : (
                    <Image source={require('@/assets/images/user.jpg')} style={styles.modalAvatarPreview} />
                  )}
                  <View style={[styles.modalAvatarOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
                    <MaterialIcons name="photo-camera" size={24} color="#FFFFFF" />
                  </View>
                </Pressable>
                <Text style={[styles.modalAvatarSub, { color: isDark ? '#8F9D97' : '#5C6F65' }]}>
                  {t('tapToChangeAvatar')}
                </Text>
              </View>

              <Text style={[styles.modalLabel, { color: isDark ? '#6B7C72' : '#6D7F76' }]}>
                {t('profileNameLabel')}
              </Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#0A100D' : '#F4F8F6', color: isDark ? '#EBF1EE' : '#34433C', borderColor: isDark ? '#1C2A24' : '#E2EFEA' }]}
                value={name}
                onChangeText={setName}
                placeholder={t('profileNameLabel')}
                placeholderTextColor={isDark ? '#5C6F65' : '#A2AEA8'}
              />
              {!isValid && (
                <Text style={styles.modalErrorText}>
                  {t('invalidNameError')}
                </Text>
              )}

              <View style={styles.modalFooterActions}>
                <Pressable
                  onPress={onClose}
                  style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: isDark ? '#1D2823' : '#EAF0EC' }]}
                >
                  <Text style={[styles.modalBtnText, { color: isDark ? '#8F9D97' : '#5C6F65' }]}>
                    {t('cancel')}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  style={[
                    styles.modalBtn,
                    styles.modalBtnSave,
                    { backgroundColor: isValid ? (isDark ? '#10B981' : '#5F806D') : (isDark ? '#1C2E26' : '#C4D4CB') }
                  ]}
                  disabled={!isValid}
                >
                  <Text style={[styles.modalBtnText, { color: isValid ? '#FFFFFF' : (isDark ? '#5A6C62' : '#AABDB5') }]}>
                    {t('save')}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}