import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  AppState,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  getAllEntries,
  addEntry,
  deleteEntry,
} from '../storage/entries';
import { getAllTasks } from '../storage/tasks';
import { DotEntry, DotTask } from '../types';
import {
  todayString,
  addDays,
  addMonths,
  formatDisplayDate,
  formatTime,
  numberToWords,
  getWeekDates,
  getMonthGrid,
  getISOWeek,
  getMonthYearLabel,
  parseDate,
  dateToString,
  generateId,
} from '../utils/dateUtils';
import TaskPalette, { PaletteItem } from '../components/TaskPalette';
import { TaskPreset, getOrCreatePresetTask } from '../utils/taskPresets';
import DotDialog, { DotDialogConfig } from '../components/DotDialog';
import { syncReminders } from '../utils/notifications';
import { hasRecentDot } from '../utils/recentDot';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

const FONT = 'NDot47';
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const RECENT_THRESHOLD_MS = 5000;

// Normalise legacy 'black' string to hex
function resolveColor(color: string): string {
  return color === 'black' ? '#000000' : color;
}

export default function CalendarScreen({ navigation, route }: Props) {
  const initialDate = route.params?.initialDate ?? todayString();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [calendarAnchor, setCalendarAnchor] = useState(initialDate);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [allEntries, setAllEntries] = useState<DotEntry[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [dialog, setDialog] = useState<DotDialogConfig | null>(null);
  const [tasks, setTasks] = useState<DotTask[]>([]);
  const savingDot = useRef(false);
  const creatingPreset = useRef(false);

  // ── Data ─────────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      const focusDate = route.params?.initialDate ?? todayString();
      setSelectedDate(focusDate);
      setCalendarAnchor(focusDate);
      loadData().then(() => {
        if (route.params?.reopenPalette) {
          setShowPalette(true);
          navigation.setParams({ reopenPalette: undefined });
        }
      }).catch(err => Alert.alert('LOAD ERROR', String(err)));
    }, [navigation, route.params?.initialDate, route.params?.reopenPalette])
  );

  // A widget can add a dot while this screen remains mounted in the background.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') loadData().catch(err => Alert.alert('LOAD ERROR', String(err)));
    });
    return () => subscription.remove();
  }, []);

  const loadData = async () => {
    const entries = await getAllEntries();
    setAllEntries(entries);
    const allTasks = await getAllTasks();
    setTasks(allTasks);
  };

  // ── Add dot on selected day ──────────────────────────────────────────────────

  const saveDot = async (item: PaletteItem, date: string) => {
    const entry: DotEntry = {
      id: generateId(),
      date,
      timestamp: new Date().toISOString(),
      actionName: item.name === 'DEFAULT' ? 'Default' : item.name,
      color: item.color,
      taskId: item.id === 'default' ? undefined : item.id,
    };
    await addEntry(entry);
    syncReminders();
    await loadData();
  };

  const handleAddDot = async (item: PaletteItem) => {
    if (savingDot.current) return;
    savingDot.current = true;
    setShowPalette(false);
    const date = selectedDate;
    try {
      const taskId = item.id === 'default' ? undefined : item.id;
      const entries = await getAllEntries();
      const now = Date.now();
      const recentlyAdded = hasRecentDot(entries, date, taskId, now, RECENT_THRESHOLD_MS);
      if (recentlyAdded) {
        Alert.alert(
          'HOLD ON',
          'YOU JUST ADDED THIS DOT. ADD ANOTHER?',
          [
            { text: 'NO', style: 'cancel' },
            {
              text: 'YES',
              onPress: () => {
                if (savingDot.current) return;
                savingDot.current = true;
                saveDot(item, date)
                  .catch(err => Alert.alert('SAVE ERROR', String(err)))
                  .finally(() => { savingDot.current = false; });
              },
            },
          ]
        );
        return;
      }
      await saveDot(item, date);
    } catch (err) {
      Alert.alert('SAVE ERROR', String(err));
    } finally {
      savingDot.current = false;
    }
  };

  const handleSelectPreset = async (preset: TaskPreset) => {
    if (creatingPreset.current) return;
    creatingPreset.current = true;
    setShowPalette(false);
    try {
      const task = await getOrCreatePresetTask(preset);
      setTasks(await getAllTasks());
      await handleAddDot(task);
    } catch (err) {
      setDialog({ title: 'TASK NOT ADDED', message: String(err), actions: [{ label: 'OK', appearance: 'solid' }] });
    } finally {
      creatingPreset.current = false;
    }
  };

  // True when the dot was logged on a different day than it belongs to
  const isBackfilled = (entry: DotEntry) =>
    dateToString(new Date(entry.timestamp)) !== entry.date;

  // ── Derived ───────────────────────────────────────────────────────────────────

  const selectedEntries = allEntries
    .filter(e => e.date === selectedDate)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Map date → entries for grid dot indicators
  const dotsByDate = new Map<string, DotEntry[]>();
  allEntries.forEach(e => {
    if (!dotsByDate.has(e.date)) dotsByDate.set(e.date, []);
    dotsByDate.get(e.date)!.push(e);
  });

  const dotCount = selectedEntries.length;
  const countLabel =
    dotCount === 0
      ? 'NO DOTS YET'
      : `YOU MADE ${numberToWords(dotCount)} DOT${dotCount !== 1 ? 'S' : ''}`;

  const calGrid =
    viewMode === 'week'
      ? [getWeekDates(calendarAnchor)]
      : getMonthGrid(calendarAnchor);

  const calSubLabel =
    viewMode === 'week'
      ? `WEEK ${getISOWeek(calendarAnchor)}`
      : getMonthYearLabel(calendarAnchor);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleLongPress = (entry: DotEntry) => {
    setDialog({
      title: 'DELETE THIS DOT?',
      message: `${entry.actionName === 'Default' ? 'DOT' : entry.actionName} AT ${formatTime(entry.timestamp)}`,
      actions: [
        { label: 'KEEP DOT', appearance: 'solid' },
        {
          label: 'DELETE',
          appearance: 'outline',
          onPress: () => {
            deleteEntry(entry.id)
              .then(() => {
                syncReminders();
                return loadData();
              })
              .catch(err => setDialog({
                title: 'DELETE FAILED',
                message: String(err),
                actions: [{ label: 'OK', appearance: 'solid' }],
              }));
          },
        },
      ],
    });
  };

  const handleCalendarNav = (dir: -1 | 1) => {
    const next = viewMode === 'week'
      ? addDays(selectedDate, dir * 7)
      : addMonths(selectedDate, dir);
    setSelectedDate(next);
    setCalendarAnchor(next);
  };

  const handleToggleView = () => {
    const next = viewMode === 'week' ? 'month' : 'week';
    setViewMode(next);
    setCalendarAnchor(selectedDate);
  };

  const handleDayNav = (dir: -1 | 1) => {
    const next = addDays(selectedDate, dir);
    setSelectedDate(next);
    setCalendarAnchor(next);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── TOP: Day detail ──────────────────────────────────────────────────── */}
      <View style={styles.topSection}>

        {/* Day navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => handleDayNav(-1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.dateLabel} numberOfLines={1}>
            {formatDisplayDate(selectedDate)}
          </Text>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => handleDayNav(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Dot count */}
        <Text style={styles.countLabel}>{countLabel}</Text>

        {/* Dot list */}
        {dotCount === 0 ? (
          <View style={styles.emptyActionArea}>
            <TouchableOpacity
              style={styles.makeDotBtn}
              onPress={() => setShowPalette(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={styles.makeDotText}>
                {selectedDate === todayString() ? 'MAKE A DOT' : 'ADD A DOT TO THIS DAY'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.dotList} contentContainerStyle={styles.dotListContent}>
            {selectedEntries.map(entry => (
            <View key={entry.id} style={styles.dotRow}>
              <TouchableOpacity
                style={styles.dotDetails}
                onLongPress={() => handleLongPress(entry)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <View style={[styles.dotBullet, { backgroundColor: resolveColor(entry.color) }]} />
                <View style={styles.dotInfo}>
                  {isBackfilled(entry) ? (
                    <Text style={styles.addedLaterLabel}>ADDED LATER</Text>
                  ) : (
                    <Text style={styles.timeLabel}>{formatTime(entry.timestamp)}</Text>
                  )}
                  {entry.actionName !== 'Default' && (
                    <Text style={styles.taskNameLabel}>{entry.actionName}</Text>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteDotBtn}
                onPress={() => handleLongPress(entry)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${entry.actionName} dot at ${formatTime(entry.timestamp)}`}
              >
                <Text style={styles.deleteDotText}>DELETE</Text>
              </TouchableOpacity>
            </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ── BOTTOM: Calendar ─────────────────────────────────────────────────── */}
      <View style={styles.bottomSection}>

        {/* Calendar nav row */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => handleCalendarNav(-1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.calNavCenter}>
            <Text style={styles.calNavLabel}>
              {viewMode === 'week' ? "THIS WEEK'S DOTS" : "THIS MONTH'S DOTS"}
            </Text>
            <Text style={styles.calSubLabel}>{calSubLabel}</Text>
          </View>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={() => handleCalendarNav(1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Day headers */}
        <View style={styles.calRow}>
          {DAY_HEADERS.map((d, i) => (
            <View key={i} style={styles.calCellContainer}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {calGrid.map((week, wi) => (
          <View key={wi} style={styles.calRow}>
            {week.map((dateStr, di) => {
              if (!dateStr) {
                return <View key={di} style={styles.calCellContainer} />;
              }
              const dayNum = parseDate(dateStr).getDate();
              const dayEntries = dotsByDate.get(dateStr) ?? [];
              const isSelected = dateStr === selectedDate;
              return (
                <TouchableOpacity
                  key={di}
                  style={styles.calCellContainer}
                  onPress={() => {
                    setSelectedDate(dateStr);
                    setCalendarAnchor(dateStr);
                  }}
                  activeOpacity={0.6}
                >
                  <Text style={[
                    styles.calDayText,
                    isSelected && styles.calDaySelected,
                  ]}>
                    {dayNum}
                  </Text>
                  {dayEntries.length > 0 && (
                    <View style={styles.dotIndicatorRow}>
                      {dayEntries.slice(0, 4).map((e, i) => (
                        <View
                          key={i}
                          style={[
                            styles.dotIndicator,
                            { backgroundColor: resolveColor(e.color) },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Toggle */}
        <TouchableOpacity style={styles.toggleBtn} onPress={handleToggleView}>
          <Text style={styles.toggleText}>
            {viewMode === 'week' ? 'CHANGE TO MONTHLY VIEW' : 'CHANGE TO WEEKLY VIEW'}
          </Text>
        </TouchableOpacity>
        {selectedDate !== todayString() && (
          <TouchableOpacity style={styles.todayBtn} onPress={() => {
            const today = todayString();
            setSelectedDate(today);
            setCalendarAnchor(today);
          }}>
            <Text style={styles.todayText}>BACK TO TODAY</Text>
          </TouchableOpacity>
        )}

      </View>

      {dotCount > 0 && (
        <TouchableOpacity
          style={styles.makeDotBtn}
          onPress={() => setShowPalette(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={styles.makeDotText}>
            {selectedDate !== todayString() ? 'ADD A DOT TO THIS DAY' : 'MAKE ANOTHER DOT'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <View style={styles.footerSlot}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.6}
          >
            <Text style={[styles.footerBtnText, styles.dotItFooterText]}>DOT IT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSlot}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.6}
          >
            <Text style={styles.footerBtnText}>MY TASKS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Task palette (adds a dot to the selected day) ────────────────────── */}
      <TaskPalette
        visible={showPalette}
        tasks={tasks}
        onSelect={handleAddDot}
        onSelectPreset={handleSelectPreset}
        onCreateTask={() => {
          setShowPalette(false);
          navigation.navigate('Tasks', { createFor: 'Calendar', returnDate: selectedDate });
        }}
        onClose={() => setShowPalette(false)}
      />
      <DotDialog config={dialog} onClose={() => setDialog(null)} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // ── Top section ───────────────────────────────────────────────────────────────
  topSection: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontFamily: FONT,
    fontSize: 12,
    color: '#000',
    lineHeight: 16,
  },
  dateLabel: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  countLabel: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  dotList: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 52,
  },
  dotListContent: { paddingBottom: 8 },
  emptyActionArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dotDetails: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  deleteDotBtn: { minWidth: 56, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  deleteDotText: { fontFamily: FONT, fontSize: 9, color: '#777' },
  dotBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 14,
  },
  dotInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeLabel: {
    fontFamily: FONT,
    fontSize: 18,
    color: '#000',
  },
  addedLaterLabel: {
    fontFamily: FONT,
    fontSize: 12,
    color: '#999',
    letterSpacing: 0.5,
  },
  taskNameLabel: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#666',
  },

  // ── Bottom section ────────────────────────────────────────────────────────────
  bottomSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  calNavCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  calNavLabel: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#000',
  },
  calSubLabel: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#000',
    marginTop: 2,
  },
  calRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 2,
  },
  calCellContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayHeaderText: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
    paddingVertical: 4,
    textAlign: 'center',
  },
  calDayText: {
    fontFamily: FONT,
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
  },
  calDaySelected: {
    textDecorationLine: 'underline',
  },
  dotIndicatorRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 36,
  },
  dotIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  toggleBtn: {
    marginTop: 10,
    paddingVertical: 6,
  },
  toggleText: {
    fontFamily: FONT,
    fontSize: 10,
    color: '#000',
  },
  todayBtn: { paddingVertical: 6 },
  todayText: { fontFamily: FONT, fontSize: 10, color: '#000' },

  makeDotBtn: {
    alignSelf: 'stretch',
    minHeight: 52,
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makeDotText: {
    fontFamily: FONT,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
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
  dotItFooterText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
