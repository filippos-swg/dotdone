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
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, DotTask } from '../types';
import { addEntry, getAllEntries } from '../storage/entries';
import { getAllTasks } from '../storage/tasks';
import { DotEntry } from '../types';
import { todayString, generateId } from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const FONT = 'NDot47';
const RECENT_THRESHOLD_MS = 5000;
const DOT_SIZE = 72;

type PaletteItem = { id: string; name: string; color: string };

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

  // ── Palette items: default black dot + user tasks ─────────────────────────

  const paletteItems: PaletteItem[] = [
    { id: 'default', name: 'DEFAULT', color: '#000000' },
    ...tasks.map(t => ({ id: t.id, name: t.name, color: t.color })),
  ];

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

      {/* ── Task palette modal ───────────────────────────────────────────────── */}
      <Modal
        visible={showPalette}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPalette(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setShowPalette(false)}>
          <View style={styles.paletteSheet}>
            <Text style={styles.paletteTitle}>CHOOSE A TASK</Text>
            <ScrollView contentContainerStyle={styles.paletteGrid}>
              {paletteItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.paletteItem}
                  onPress={() => handleSelectTask(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.paletteDot, { backgroundColor: item.color }]} />
                  <Text style={styles.paletteName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelPalette} onPress={() => setShowPalette(false)}>
              <Text style={styles.cancelPaletteText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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

  // ── Palette ──────────────────────────────────────────────────────────────────
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
