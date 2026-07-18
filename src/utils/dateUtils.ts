// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Date string helpers ───────────────────────────────────────────────────────

export function todayString(): string {
  return dateToString(new Date());
}

export function dateToString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return dateToString(d);
}

export function addMonths(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  // Use day 1 to avoid overflow (e.g. Jan 31 + 1 month = March 3)
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return dateToString(first);
}

// ─── Formatting ────────────────────────────────────────────────────────────────

const DAYS_LONG = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
];
const MONTHS_LONG = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

export function formatDisplayDate(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}.${m}`;
}

export function numberToWords(n: number): string {
  const words = [
    'ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX',
    'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE',
    'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN',
    'EIGHTEEN', 'NINETEEN', 'TWENTY',
  ];
  return words[n] ?? 'MANY';
}

// ─── Calendar helpers ──────────────────────────────────────────────────────────

/**
 * Returns 7 date strings Mon–Sun for the week containing anchorDate.
 */
export function getWeekDates(anchorDate: string): string[] {
  const d = parseDate(anchorDate);
  const dow = d.getDay(); // 0 = Sun
  const toMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(d);
  monday.setDate(d.getDate() + toMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return dateToString(day);
  });
}

/**
 * Returns the ISO week number (1–53) for a given date string.
 */
export function getISOWeek(dateStr: string): number {
  const d = parseDate(dateStr);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7; // Mon=1 … Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - day); // nearest Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Returns "MAY 2026" style label for the month containing anchorDate.
 */
export function getMonthYearLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Returns a 2D array of weeks (Mon–Sun) for the month containing anchorDate.
 * Slots before the first day and after the last day are null.
 */
export function getMonthGrid(anchorDate: string): (string | null)[][] {
  const d = parseDate(anchorDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
  const startPad = firstDow === 0 ? 6 : firstDow - 1; // Monday-anchored

  const flat: (string | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      dateToString(new Date(year, month, i + 1))
    ),
  ];
  while (flat.length % 7 !== 0) flat.push(null);

  const grid: (string | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    grid.push(flat.slice(i, i + 7));
  }
  return grid;
}
