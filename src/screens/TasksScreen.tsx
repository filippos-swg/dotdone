import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, DotTask } from '../types';
import {
  getAllTasks,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../storage/tasks';
import { TASK_COLORS } from '../utils/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const FONT = 'NDot47';
const COLORS_PER_ROW = 6;

type FormMode = 'none' | 'add' | 'edit';

export default function TasksScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<DotTask[]>([]);
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [editingTask, setEditingTask] = useState<DotTask | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const all = await getAllTasks();
    setTasks(all);
    setUsedColors(all.map(t => t.color));
  };

  // ── Form helpers ──────────────────────────────────────────────────────────────

  const openAddForm = () => {
    setEditingTask(null);
    setNameInput('');
    setSelectedColor('');
    setFormMode('add');
  };

  const openEditForm = (task: DotTask) => {
    setEditingTask(task);
    setNameInput(task.name);
    setSelectedColor(task.color);
    setFormMode('edit');
  };

  const closeForm = () => {
    setFormMode('none');
    setEditingTask(null);
    setNameInput('');
    setSelectedColor('');
  };

  const handleSave = async () => {
    const trimmed = nameInput.trim().toUpperCase();
    if (!trimmed) {
      Alert.alert('NAME REQUIRED', 'PLEASE ENTER A NAME FOR THIS TASK.');
      return;
    }
    if (!selectedColor) {
      Alert.alert('COLOR REQUIRED', 'PLEASE PICK A COLOR FOR THIS TASK.');
      return;
    }

    if (formMode === 'add') {
      await addTask(trimmed, selectedColor);
    } else if (formMode === 'edit' && editingTask) {
      await updateTask({ ...editingTask, name: trimmed, color: selectedColor });
    }
    closeForm();
    await loadTasks();
  };

  const handleDelete = (task: DotTask) => {
    Alert.alert(
      'DELETE TASK',
      `DELETE "${task.name}"?\nDOTS ALREADY RECORDED WILL KEEP THEIR COLOR.`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            closeForm();
            await loadTasks();
          },
        },
      ]
    );
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...tasks];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    setTasks(reordered);
    await saveTasks(reordered);
  };

  const handleMoveDown = async (index: number) => {
    if (index === tasks.length - 1) return;
    const reordered = [...tasks];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setTasks(reordered);
    await saveTasks(reordered);
  };

  // ── Color picker ──────────────────────────────────────────────────────────────

  const isColorAvailable = (color: string) => {
    if (formMode === 'edit' && editingTask?.color === color) return true;
    return !usedColors.includes(color);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  const canAddMore = tasks.length < TASK_COLORS.length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MY TASKS</Text>
      </View>

      {/* ── Task list ──────────────────────────────────────────────────────── */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {tasks.length === 0 && formMode === 'none' && (
          <Text style={styles.emptyText}>
            NO TASKS YET.{'\n'}TAP + TO CREATE ONE.
          </Text>
        )}

        {tasks.map((task, index) => (
          <View key={task.id} style={styles.taskRow}>
            <View style={[styles.taskDot, { backgroundColor: task.color }]} />
            <TouchableOpacity
              style={styles.taskNameBtn}
              onPress={() => openEditForm(task)}
              activeOpacity={0.7}
            >
              <Text style={styles.taskName}>{task.name}</Text>
            </TouchableOpacity>
            <View style={styles.taskActions}>
              <TouchableOpacity
                style={[styles.orderBtn, index === 0 && styles.orderBtnDisabled]}
                onPress={() => handleMoveUp(index)}
                disabled={index === 0}
              >
                <Text style={styles.orderBtnText}>↑</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.orderBtn, index === tasks.length - 1 && styles.orderBtnDisabled]}
                onPress={() => handleMoveDown(index)}
                disabled={index === tasks.length - 1}
              >
                <Text style={styles.orderBtnText}>↓</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── Inline form ──────────────────────────────────────────────────── */}
        {formMode !== 'none' && (
          <View style={styles.form}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={t => setNameInput(t.toUpperCase())}
              placeholder="TASK NAME"
              placeholderTextColor="#999"
              autoFocus
              maxLength={24}
            />

            {/* Color grid */}
            <View style={styles.colorGrid}>
              {TASK_COLORS.map(color => {
                const available = isColorAvailable(color);
                const selected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCell,
                      { backgroundColor: available ? color : '#eee' },
                      selected && styles.colorCellSelected,
                      !available && styles.colorCellUnavailable,
                    ]}
                    onPress={() => available && setSelectedColor(color)}
                    activeOpacity={available ? 0.7 : 1}
                  >
                    {!available && (
                      <Text style={styles.colorCellTaken}>✕</Text>
                    )}
                    {selected && (
                      <Text style={styles.colorCellCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Form buttons */}
            <View style={styles.formButtons}>
              {formMode === 'edit' && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => editingTask && handleDelete(editingTask)}
                >
                  <Text style={styles.deleteBtnText}>DELETE</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelBtn} onPress={closeForm}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.footerSlot}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.6}
          >
            <Text style={styles.footerBtnText}>HOME</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSlot}>
          {canAddMore && formMode === 'none' && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={openAddForm}
              activeOpacity={0.7}
            >
              <View style={styles.plusH} />
              <View style={styles.plusV} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerSlot}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Calendar', {})}
            activeOpacity={0.6}
          >
            <Text style={styles.footerBtnText}>CALENDAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    paddingTop: 64,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#000',
  },

  // ── List ─────────────────────────────────────────────────────────────────────
  list: { flex: 1 },
  listContent: { paddingHorizontal: 24, paddingBottom: 20 },

  emptyText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 60,
    lineHeight: 22,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  taskDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 14,
  },
  taskNameBtn: { flex: 1 },
  taskName: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
  },
  taskActions: {
    flexDirection: 'row',
    gap: 6,
  },
  orderBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnDisabled: {
    borderColor: '#ccc',
  },
  orderBtnText: {
    fontFamily: FONT,
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
  },

  // ── Form ─────────────────────────────────────────────────────────────────────
  form: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#eee',
  },
  nameInput: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 8,
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCellSelected: {
    borderWidth: 3,
    borderColor: '#000',
  },
  colorCellUnavailable: {
    opacity: 0.25,
  },
  colorCellTaken: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  colorCellCheck: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#cc0000',
    borderRadius: 4,
    marginRight: 'auto',
  },
  deleteBtnText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#cc0000',
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
  },
  cancelBtnText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#999',
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
  },
  saveBtnText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 40,
  },
  footerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  footerBtnText: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
    letterSpacing: 0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  plusV: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: '#fff',
    borderRadius: 1,
  },
});
