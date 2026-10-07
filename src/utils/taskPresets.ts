import { DotTask } from '../types';
import { addTask, getAllTasks, updateTask } from '../storage/tasks';

export type TaskPreset = {
  name: string;
  colors: readonly string[];
};

// Each suggestion starts with the requested color and can use another shade
// from the same family if someone has already assigned that color to a task.
export const TASK_PRESETS: readonly TaskPreset[] = [
  { name: 'GARBAGE', colors: ['#996633', '#5F4B32'] },
  { name: 'PILLS', colors: ['#2980B9', '#0039A6', '#003688', '#4169E1'] },
  { name: 'CALL MOM', colors: ['#FF69B4', '#E84393', '#C72585', '#9B0056'] },
  { name: 'WATER PLANTS', colors: ['#FFD300', '#FCCC0A', '#DAA520'] },
  { name: 'GO OUTSIDE', colors: ['#FF8C00', '#EE7C0E', '#FF6319', '#D35400'] },
];

export function availablePresetColor(preset: TaskPreset, tasks: DotTask[]): string | undefined {
  const used = new Set(tasks.map(task => task.color.toUpperCase()));
  return preset.colors.find(color => !used.has(color));
}

export async function getOrCreatePresetTask(preset: TaskPreset): Promise<DotTask> {
  const tasks = await getAllTasks();
  const existing = tasks.find(task => task.name.trim().toUpperCase() === preset.name);
  if (existing && preset.colors.includes(existing.color.toUpperCase())) return existing;

  const color = availablePresetColor(preset, tasks);
  if (!color) throw new Error(`ALL ${preset.name} COLORS ARE IN USE. PICK A COLOR IN MY TASKS.`);
  if (existing) {
    const updated = { ...existing, color };
    await updateTask(updated);
    return updated;
  }
  return addTask(preset.name, color);
}
