import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={() => {}}>
          <View style={styles.iconBox}>
            <MaterialIcons
              name={destructive ? 'delete-outline' : 'info-outline'}
              size={28}
              color={destructive ? '#E34C49' : '#5F806D'}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, destructive ? styles.deleteButton : styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  iconBox: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F7FBF8',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  title: {
    color: '#26302B',
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: '#6C7C74',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#EFF4F0',
  },
  cancelText: {
    color: '#6D7F76',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: '#E34C49',
  },
  confirmButton: {
    backgroundColor: '#5F806D',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});