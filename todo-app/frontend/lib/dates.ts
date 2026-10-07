// Due dates are calendar days ("YYYY-MM-DD") in the user's local timezone.
// Never route them through Date#toISOString(), which converts to UTC and can shift the day.

export type DayKey = string; // "YYYY-MM-DD"

export function toDayKey(d: Date): DayKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DayKey, n: number): DayKey {
  const d = fromDayKey(key);
  d.setDate(d.getDate() + n);
  return toDayKey(d);
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

/** "Today", "Tomorrow", "Yesterday", or e.g. "Fri, Oct 10" (adds the year if it differs). */
export function relativeDayLabel(key: DayKey, today: DayKey = todayKey()): string {
  if (key === today) return "Today";
  if (key === addDays(today, 1)) return "Tomorrow";
  if (key === addDays(today, -1)) return "Yesterday";
  const d = fromDayKey(key);
  const sameYear = d.getFullYear() === fromDayKey(today).getFullYear();
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export type DueGroup = "overdue" | "today" | "tomorrow" | "upcoming" | "none";

export function dueGroup(due: DayKey | null | undefined, today: DayKey = todayKey()): DueGroup {
  if (!due) return "none";
  if (due < today) return "overdue"; // ISO day keys compare correctly as strings
  if (due === today) return "today";
  if (due === addDays(today, 1)) return "tomorrow";
  return "upcoming";
}
