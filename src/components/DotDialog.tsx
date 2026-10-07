import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FONT = 'NDot47';

export type DotDialogAction = {
  label: string;
  appearance: 'solid' | 'outline';
  onPress?: () => void;
};

export type DotDialogConfig = {
  title: string;
  message: string;
  actions: DotDialogAction[];
};

type Props = {
  config: DotDialogConfig | null;
  onClose: () => void;
};

export default function DotDialog({ config, onClose }: Props) {
  const choose = (action: DotDialogAction) => {
    onClose();
    action.onPress?.();
  };

  return (
    <Modal
      visible={config !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} accessibilityLabel="Close dialog" />
        {config && (
          <View style={styles.card} accessibilityViewIsModal>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.message}>{config.message}</Text>
            <View style={styles.actions}>
              {config.actions.map((action, index) => (
                <TouchableOpacity
                  key={`${action.label}-${index}`}
                  style={[styles.action, action.appearance === 'solid' ? styles.solid : styles.outline]}
                  onPress={() => choose(action)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                >
                  <Text style={[styles.actionText, action.appearance === 'solid' && styles.solidText]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
  },
  title: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginBottom: 14,
  },
  message: {
    fontFamily: FONT,
    fontSize: 12,
    lineHeight: 20,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000',
  },
  solid: { backgroundColor: '#000' },
  outline: { backgroundColor: '#fff' },
  actionText: { fontFamily: FONT, fontSize: 11, color: '#000', textAlign: 'center' },
  solidText: { color: '#fff' },
});
