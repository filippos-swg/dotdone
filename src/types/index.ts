export interface DotTask {
  id: string;
  name: string;
  color: string; // hex e.g. '#EE352E'
  order: number;
  // v1.2 — optional so files written by v1.0/v1.1 still read. Absent means off.
  reminderEnabled?: boolean;
  reminderTime?: string; // "HH:MM", 24h local time
}

export interface DotEntry {
  id: string;
  date: string;       // "YYYY-MM-DD"
  timestamp: string;  // ISO string
  actionName: string; // task name or 'Default'
  color: string;      // hex or legacy 'black'
  taskId?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Calendar: { initialDate?: string };
  Tasks: undefined;
};
