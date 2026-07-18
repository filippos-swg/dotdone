import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { DotTask } from '../types';

const FONT = 'NDot47';

export type PaletteItem = { id: string; name: string; color: string };

type Props = {
  visible: boolean;
  tasks: DotTask[];
  onSelect: (item: PaletteItem) => void;
  onClose: () => void;
};

export default function TaskPalette({ visible, tasks, onSelect, onClose }: Props) {
  const paletteItems: PaletteItem[] = [
    { id: 'default', name: 'DEFAULT', color: '#000000' },
    ...tasks.map(t => ({ id: t.id, name: t.name, color: t.color })),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.paletteSheet}>
          <Text style={styles.paletteTitle}>CHOOSE A TASK</Text>
          <ScrollView contentContainerStyle={styles.paletteGrid}>
            {paletteItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.paletteItem}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.paletteDot, { backgroundColor: item.color }]} />
                <Text style={styles.paletteName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.cancelPalette} onPress={onClose}>
            <Text style={styles.cancelPaletteText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  paletteSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  paletteTitle: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 16,
  },
  paletteItem: {
    alignItems: 'center',
    width: 64,
    gap: 6,
  },
  paletteDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  paletteName: {
    fontFamily: FONT,
    fontSize: 9,
    color: '#000',
    textAlign: 'center',
  },
  cancelPalette: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelPaletteText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#999',
  },
});
