import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RootStackParamList, DotTask } from '../types';
import {
  getAllTasks,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
} from '../storage/tasks';
import { TASK_COLORS } from '../utils/colors';
import {
  DEFAULT_REMINDER_TIME,
  requestReminderPermission,
  syncReminders,
  formatReminderTime,
  reminderTimeToDate,
  dateToReminderTime,
} from '../utils/notifications';
import { exportData } from '../utils/exportData';
import DotDialog, { DotDialogConfig } from '../components/DotDialog';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const FONT = 'NDot47';
const COLORS_PER_ROW = 6;

type FormMode = 'none' | 'add' | 'edit';

export default function TasksScreen({ navigation, route }: Props) {
  const [tasks, setTasks] = useState<DotTask[]>([]);
  const [usedColors, setUsedColors] = useState<string[]>([]);
  const [formMode, setFormMode] = useState<FormMode>('none');
  const [editingTask, setEditingTask] = useState<DotTask | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dialog, setDialog] = useState<DotDialogConfig | null>(null);
  const [creationReturn, setCreationReturn] = useState<{
    screen: 'Home' | 'Calendar'; date?: string;
  } | null>(null);
  const saveInProgress = useRef(false);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      if (route.params?.createFor) {
        openAddForm();
        setCreationReturn({ screen: route.params.createFor, date: route.params.returnDate });
        navigation.setParams({ createFor: undefined, returnDate: undefined });
      }
    }, [navigation, route.params?.createFor, route.params?.returnDate])
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
    setReminderOn(false);
    setReminderTime(DEFAULT_REMINDER_TIME);
    setShowTimePicker(false);
    setFormMode('add');
  };

  const openEditForm = (task: DotTask) => {
    setEditingTask(task);
    setNameInput(task.name);
    setSelectedColor(task.color);
    setReminderOn(task.reminderEnabled === true);
    setReminderTime(task.reminderTime ?? DEFAULT_REMINDER_TIME);
    setShowTimePicker(false);
    setFormMode('edit');
  };

  const closeForm = () => {
    setFormMode('none');
    setEditingTask(null);
    setNameInput('');
    setSelectedColor('');
    setReminderOn(false);
    setReminderTime(DEFAULT_REMINDER_TIME);
    setShowTimePicker(false);
  };

  // ── Reminder ──────────────────────────────────────────────────────────────────

  const handleToggleReminder = async () => {
    if (reminderOn) {
      setReminderOn(false);
      setShowTimePicker(false);
      return;
    }
    // Permission is asked for here, on first enable, and never at launch.
    // A refusal simply leaves the switch off.
    const granted = await requestReminderPermission();
    if (!granted) return;
    setReminderOn(true);
  };

  const handleTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowTimePicker(false);
    if (event.type === 'dismissed' || !date) return;
    setReminderTime(dateToReminderTime(date));
  };

  const handleSave = async () => {
    if (saveInProgress.current) return;
    const trimmed = nameInput.trim().toUpperCase();
    if (!trimmed) {
      Keyboard.dismiss();
      setDialog({ title: 'NAME REQUIRED', message: 'GIVE THIS TASK A NAME FIRST.', actions: [{ label: 'OK', appearance: 'solid' }] });
      return;
    }
    if (!selectedColor) {
      Keyboard.dismiss();
      setDialog({ title: 'PICK A COLOR', message: `CHOOSE A COLOR FOR ${trimmed}.`, actions: [{ label: 'OK', appearance: 'solid' }] });
      return;
    }

    saveInProgress.current = true;
    try {
      const reminder = { reminderEnabled: reminderOn, reminderTime };
      if (formMode === 'add') {
        await addTask(trimmed, selectedColor, reminder);
      } else if (formMode === 'edit' && editingTask) {
        await updateTask({ ...editingTask, name: trimmed, color: selectedColor, ...reminder });
      }
      closeForm();
      await loadTasks();
      syncReminders();
      if (creationReturn) returnToPalette(creationReturn);
    } catch (err) {
      setDialog({ title: 'SAVE ERROR', message: String(err), actions: [{ label: 'OK', appearance: 'solid' }] });
    } finally {
      saveInProgress.current = false;
    }
  };

  const returnToPalette = (origin: { screen: 'Home' | 'Calendar'; date?: string }) => {
    setCreationReturn(null);
    if (origin.screen === 'Calendar') {
      navigation.popTo('Calendar', { initialDate: origin.date, reopenPalette: true });
    } else {
      navigation.popTo('Home', { reopenPalette: true });
    }
  };

  const handleCancelForm = () => {
    closeForm();
    if (creationReturn) returnToPalette(creationReturn);
  };

  const handleDelete = (task: DotTask) => {
    Keyboard.dismiss();
    setDialog({
      title: 'DELETE TASK?',
      message: `${task.name}\nPAST DOTS WILL KEEP THEIR COLOR.`,
      actions: [
        { label: 'KEEP TASK', appearance: 'solid' },
        { label: 'DELETE', appearance: 'outline', onPress: () => {
          deleteTask(task.id)
            .then(async () => {
              closeForm();
              await loadTasks();
              syncReminders();
            })
            .catch(err => setDialog({
              title: 'DELETE FAILED', message: String(err),
              actions: [{ label: 'OK', appearance: 'solid' }],
            }));
        } },
      ],
    });
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

  // ── Export ────────────────────────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      const result = await exportData();
      if (result === 'unavailable') {
        setDialog({ title: 'EXPORT UNAVAILABLE', message: 'THIS DEVICE HAS NO SHARE SHEET.', actions: [{ label: 'OK', appearance: 'solid' }] });
      }
    } catch (err) {
      setDialog({ title: 'EXPORT ERROR', message: String(err), actions: [{ label: 'OK', appearance: 'solid' }] });
    }
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
            NO COLORED TASKS YET.{'\n'}
            NAME ONE AND PICK ITS COLOR.
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
              {task.reminderEnabled === true && (
                <Text style={styles.taskReminderHint}>
                  {formatReminderTime(task.reminderTime)}
                </Text>
              )}
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
            <Text style={styles.colorLabel}>PICK A COLOR</Text>
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

            {/* Reminder */}
            <View style={styles.reminderRow}>
              <Text style={styles.reminderLabel}>DAILY REMINDER</Text>
              <TouchableOpacity
                style={[styles.switchTrack, reminderOn && styles.switchTrackOn]}
                onPress={handleToggleReminder}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="switch"
                accessibilityState={{ checked: reminderOn }}
                accessibilityLabel="Daily reminder"
              >
                <View style={[styles.switchKnob, reminderOn && styles.switchKnobOn]} />
              </TouchableOpacity>
            </View>

            {reminderOn && (
              <>
                <View style={styles.reminderRow}>
                  <Text style={styles.reminderSub}>EVERY DAY AT</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(v => !v)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  >
                    <Text style={[styles.reminderTime, showTimePicker && styles.reminderTimeActive]}>
                      {formatReminderTime(reminderTime)}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showTimePicker && (
                  <DateTimePicker
                    value={reminderTimeToDate(reminderTime)}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    textColor="#000"
                    themeVariant="light"
                    style={styles.timePicker}
                  />
                )}
                <Text style={styles.reminderNote}>
                  QUIET ON DAYS YOU'VE ALREADY MADE THE DOT.
                </Text>
              </>
            )}

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
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelForm}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Export ───────────────────────────────────────────────────────── */}
        {formMode === 'none' && (
          <TouchableOpacity
            style={styles.exportRow}
            onPress={handleExport}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
          >
            <Text style={styles.exportText}>EXPORT DATA</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {canAddMore && formMode === 'none' && (
        <TouchableOpacity
          style={styles.addTaskBtn}
          onPress={openAddForm}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.addTaskBtnText}>ADD A COLORED TASK</Text>
        </TouchableOpacity>
      )}

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
          <TouchableOpacity
            onPress={() => navigation.navigate('Calendar', {})}
            activeOpacity={0.6}
          >
            <Text style={styles.footerBtnText}>CALENDAR</Text>
          </TouchableOpacity>
        </View>
      </View>
      <DotDialog config={dialog} onClose={() => setDialog(null)} />
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
  taskNameBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  taskName: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
  },
  taskReminderHint: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#999',
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
    marginBottom: 18,
  },
  colorLabel: { fontFamily: FONT, fontSize: 11, color: '#000', marginBottom: 14 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  addTaskBtn: {
    minHeight: 52,
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskBtnText: { fontFamily: FONT, fontSize: 12, color: '#fff' },
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  reminderLabel: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
  },
  reminderSub: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#666',
    letterSpacing: 0.5,
  },
  reminderTime: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#000',
  },
  reminderTimeActive: {
    textDecorationLine: 'underline',
  },
  reminderNote: {
    fontFamily: FONT,
    fontSize: 9,
    color: '#999',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 12,
  },
  timePicker: {
    alignSelf: 'center',
    height: 150,
    marginVertical: 4,
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  switchTrackOn: {
    backgroundColor: '#000',
    alignItems: 'flex-end',
  },
  switchKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
  },
  switchKnobOn: {
    backgroundColor: '#fff',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
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

  // ── Export ───────────────────────────────────────────────────────────────────
  exportRow: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 40,
  },
  exportText: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#999',
    letterSpacing: 1,
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
});
