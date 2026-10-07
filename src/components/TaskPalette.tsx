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
import { TASK_PRESETS, TaskPreset, availablePresetColor } from '../utils/taskPresets';
import { TASK_COLORS } from '../utils/colors';

const FONT = 'NDot47';

export type PaletteItem = { id: string; name: string; color: string };

type Props = {
  visible: boolean;
  tasks: DotTask[];
  onSelect: (item: PaletteItem) => void;
  onSelectPreset: (preset: TaskPreset) => void;
  onCreateTask: () => void;
  onClose: () => void;
};

export default function TaskPalette({ visible, tasks, onSelect, onSelectPreset, onCreateTask, onClose }: Props) {
  const paletteItems: PaletteItem[] = [
    { id: 'default', name: 'DEFAULT', color: '#000000' },
    ...tasks.map(t => ({ id: t.id, name: t.name, color: t.color })),
  ];
  const presets = TASK_PRESETS.filter(preset => {
    const existing = tasks.find(task => task.name.trim().toUpperCase() === preset.name);
    return (!existing || !preset.colors.includes(existing.color.toUpperCase())) &&
      !!availablePresetColor(preset, tasks);
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close task picker" />
        <View style={styles.paletteSheet}>
          <Text style={styles.paletteTitle}>CHOOSE A TASK</Text>
          <ScrollView contentContainerStyle={styles.paletteContent}>
            <Text style={styles.sectionLabel}>YOUR TASKS</Text>
            <View style={styles.paletteGrid}>
              {paletteItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.paletteItem}
                  onPress={() => onSelect(item)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Make a ${item.name.toLowerCase()} dot`}
                >
                  <View style={[styles.paletteDot, { backgroundColor: item.color }]} />
                  <Text style={styles.paletteName} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {presets.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>READY-MADE TASKS</Text>
                <View style={styles.paletteGrid}>
                  {presets.map(preset => (
                    <TouchableOpacity
                      key={preset.name}
                      style={styles.paletteItem}
                      onPress={() => onSelectPreset(preset)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Use ${preset.name.toLowerCase()} preset and make a dot`}
                    >
                      <View style={[styles.paletteDot, { backgroundColor: availablePresetColor(preset, tasks) }]} />
                      <Text style={styles.paletteName} numberOfLines={2}>{preset.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.createTask}
            onPress={onCreateTask}
            disabled={tasks.length >= TASK_COLORS.length}
            accessibilityRole="button"
          >
            <Text style={styles.createTaskText}>
              {tasks.length >= TASK_COLORS.length ? 'TASK LIMIT REACHED' : '+ NEW TASK & COLOR'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelPalette} onPress={onClose}>
            <Text style={styles.cancelPaletteText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  paletteSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  paletteTitle: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  paletteContent: { paddingBottom: 16 },
  sectionLabel: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#777',
    marginBottom: 14,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
    paddingBottom: 20,
  },
  paletteItem: {
    alignItems: 'center',
    width: 68,
    minHeight: 68,
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
  createTask: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  createTaskText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
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
