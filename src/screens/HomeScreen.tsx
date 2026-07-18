import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  TouchableOpacity,
  StatusBar,
  GestureResponderEvent,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DotTask } from '../types';
import { addEntry, getAllEntries } from '../storage/entries';
import { getAllTasks } from '../storage/tasks';
import { DotEntry } from '../types';
import { todayString, generateId } from '../utils/dateUtils';
import TaskPalette, { PaletteItem } from '../components/TaskPalette';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const FONT = 'NDot47';
const RECENT_THRESHOLD_MS = 5000;
const DOT_SIZE = 72;

export default function HomeScreen({ navigation }: Props) {
  const [pressing, setPressing] = useState(false);
  const [pressPos, setPressPos] = useState({ x: 0, y: 0 });
  const [showPalette, setShowPalette] = useState(false);
  const [tasks, setTasks] = useState<DotTask[]>([]);
  const longPressTriggered = useRef(false);

  useFocusEffect(
    useCallback(() => {
      getAllTasks().then(setTasks);
    }, [])
  );

  // ── Save logic ────────────────────────────────────────────────────────────

  const doSave = async (actionName = 'Default', color = '#000000', taskId?: string) => {
    const entry: DotEntry = {
      id: generateId(),
      date: todayString(),
      timestamp: new Date().toISOString(),
      actionName,
      color,
      taskId,
    };
    await addEntry(entry);
    navigation.navigate('Calendar', {});
  };

  const attemptSave = async (actionName = 'Default', color = '#000000', taskId?: string) => {
    const today = todayString();
    const all = await getAllEntries();
    const todayEntries = all
      .filter(e => e.date === today)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (todayEntries.length > 0) {
      const last = todayEntries[todayEntries.length - 1];
      const elapsed = Date.now() - new Date(last.timestamp).getTime();
      if (elapsed < RECENT_THRESHOLD_MS) {
        Alert.alert(
          'HOLD ON',
          'YOU ALREADY MADE A DOT JUST NOW.\nARE YOU SURE YOU WANT ANOTHER?',
          [
            { text: 'NO', style: 'cancel' },
            {
              text: 'YES',
              onPress: () =>
                doSave(actionName, color, taskId).catch(err =>
                  Alert.alert('SAVE ERROR', String(err))
                ),
            },
          ]
        );
        return;
      }
    }
    await doSave(actionName, color, taskId);
  };

  // ── Press handlers ────────────────────────────────────────────────────────

  const handlePressIn = (e: GestureResponderEvent) => {
    longPressTriggered.current = false;
    setPressing(true);
    setPressPos({ x: e.nativeEvent.locationX, y: e.nativeEvent.locationY });
  };

  const handleLongPress = () => {
    longPressTriggered.current = true;
    setPressing(false);
    setShowPalette(true);
  };

  const handlePressOut = () => {
    setPressing(false);
    if (!longPressTriggered.current) {
      attemptSave().catch(err => Alert.alert('SAVE ERROR', String(err)));
    }
  };

  // ── Palette selection ─────────────────────────────────────────────────────

  const handleSelectTask = (item: PaletteItem) => {
    setShowPalette(false);
    const taskId = item.id === 'default' ? undefined : item.id;
    attemptSave(item.name, item.color, taskId).catch(err =>
      Alert.alert('SAVE ERROR', String(err))
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Pressable
        style={styles.tapZone}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={400}
      >
        {!pressing && (
          <View style={styles.contentArea}>
            <Text style={styles.title}>DotDone</Text>
            <Text style={styles.subtitle}>
              A SIMPLE CALENDAR APP{'\n'}
              TO REMIND YOU IF YOU'VE{'\n'}
              DONE THE THING
            </Text>
            <View style={styles.spacer} />
            <Text style={styles.instructions}>
              TAP TO RECORD A DOT.{'\n'}
              HOLD TO CHOOSE A TASK.
            </Text>
          </View>
        )}

        {pressing && (
          <View
            pointerEvents="none"
            style={[
              styles.floatingDot,
              { top: pressPos.y - DOT_SIZE / 2, left: pressPos.x - DOT_SIZE / 2 },
            ]}
          />
        )}
      </Pressable>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => navigation.navigate('Tasks')}
          activeOpacity={0.6}
        >
          <Ionicons name="ellipse-outline" size={20} color="#000" />
          <Text style={styles.footerBtnText}>MY TASKS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerBtn}
          onPress={() => navigation.navigate('Calendar', {})}
          activeOpacity={0.6}
        >
          <Ionicons name="calendar-outline" size={20} color="#000" />
          <Text style={styles.footerBtnText}>CALENDAR</Text>
        </TouchableOpacity>
      </View>

      {/* ── Task palette ─────────────────────────────────────────────────────── */}
      <TaskPalette
        visible={showPalette}
        tasks={tasks}
        onSelect={handleSelectTask}
        onClose={() => setShowPalette(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tapZone: { flex: 1 },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  title: { fontFamily: FONT, fontSize: 30, color: '#000', marginBottom: 16, textAlign: 'center' },
  subtitle: { fontFamily: FONT, fontSize: 12, color: '#000', textAlign: 'center', lineHeight: 22 },
  spacer: { flex: 1 },
  instructions: {
    fontFamily: FONT,
    fontSize: 11,
    color: '#000',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  floatingDot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#000',
  },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 40,
  },
  footerBtn: { alignItems: 'center', gap: 4 },
  footerBtnText: { fontFamily: FONT, fontSize: 11, color: '#000', letterSpacing: 0.5 },
});
