import * as FileSystem from 'expo-file-system/legacy';
import { DotTask } from '../types';
import { generateId } from '../utils/dateUtils';

const TASKS_FILE = FileSystem.documentDirectory + 'dotdone_tasks.json';

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) return fallback;
    const raw = await FileSystem.readAsStringAsync(path);
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(path: string, data: unknown): Promise<void> {
  await FileSystem.writeAsStringAsync(path, JSON.stringify(data));
}

export async function getAllTasks(): Promise<DotTask[]> {
  const tasks = await readJSON<DotTask[]>(TASKS_FILE, []);
  return tasks.sort((a, b) => a.order - b.order);
}

export async function saveTasks(tasks: DotTask[]): Promise<void> {
  // Re-normalise order before saving
  const normalised = tasks.map((t, i) => ({ ...t, order: i }));
  await writeJSON(TASKS_FILE, normalised);
}

export async function addTask(name: string, color: string): Promise<DotTask> {
  const all = await getAllTasks();
  const task: DotTask = {
    id: generateId(),
    name,
    color,
    order: all.length,
  };
  all.push(task);
  await writeJSON(TASKS_FILE, all);
  return task;
}

export async function updateTask(updated: DotTask): Promise<void> {
  const all = await getAllTasks();
  const idx = all.findIndex(t => t.id === updated.id);
  if (idx !== -1) {
    all[idx] = updated;
    await writeJSON(TASKS_FILE, all);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const all = await getAllTasks();
  const filtered = all.filter(t => t.id !== id).map((t, i) => ({ ...t, order: i }));
  await writeJSON(TASKS_FILE, filtered);
}

export async function getUsedColors(): Promise<string[]> {
  const tasks = await getAllTasks();
  return tasks.map(t => t.color);
}
