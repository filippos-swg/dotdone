import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import {
  getAllEntries,
  addEntry,
  deleteEntry,
  hasDeleteHintBeenSeen,
  markDeleteHintSeen,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

const FONT = 'NDot47';
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
  const [showHint, setShowHint] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [tasks, setTasks] = useState<DotTask[]>([]);

  // ── Data ─────────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const entries = await getAllEntries();
    setAllEntries(entries);
    const allTasks = await getAllTasks();
    setTasks(allTasks);
    const seen = await hasDeleteHintBeenSeen();
    if (!seen && entries.length > 0) {
      setShowHint(true);
      await markDeleteHintSeen();
    }
  };

  // ── Add dot on selected day ──────────────────────────────────────────────────

  const handleAddDot = async (item: PaletteItem) => {
    setShowPalette(false);
    const entry: DotEntry = {
      id: generateId(),
      date: selectedDate,
      timestamp: new Date().toISOString(),
      actionName: item.name === 'DEFAULT' ? 'Default' : item.name,
      color: item.color,
      taskId: item.id === 'default' ? undefined : item.id,
    };
    try {
      await addEntry(entry);
      await loadData();
    } catch (err) {
      Alert.alert('SAVE ERROR', String(err));
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
    Alert.alert(
      'DELETE DOT',
      `DELETE DOT AT ${formatTime(entry.timestamp)}?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entry.id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleCalendarNav = (dir: -1 | 1) => {
    setCalendarAnchor(a =>
      viewMode === 'week' ? addDays(a, dir * 7) : addMonths(a, dir)
    );
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
        <View style={styles.dotList}>
          {selectedEntries.map(entry => (
            <TouchableOpacity
              key={entry.id}
              style={styles.dotRow}
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
          ))}
        </View>

        {showHint && dotCount > 0 && (
          <Text style={styles.hintText}>LONG PRESS A DOT TO DELETE</Text>
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
                  onPress={() => setSelectedDate(dateStr)}
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

      </View>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
            style={styles.addBtn}
            onPress={() => setShowPalette(true)}
            activeOpacity={0.7}
          >
            <View style={styles.plusH} />
            <View style={styles.plusV} />
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
        onClose={() => setShowPalette(false)}
      />

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
    width: '100%',
    paddingHorizontal: 52,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
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
  hintText: {
    fontFamily: FONT,
    fontSize: 9,
    color: '#999',
    marginTop: 12,
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
