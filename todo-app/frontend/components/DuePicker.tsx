"use client";

import { addDays, todayKey, type DayKey } from "@/lib/dates";

/** Quick due-date chips (Today / Tomorrow / Next week / No date) plus a native date input. */
export default function DuePicker({
  value,
  onChange,
  disabled,
}: {
  value: DayKey | null;
  onChange: (value: DayKey | null) => void;
  disabled?: boolean;
}) {
  const today = todayKey();
  const options: { label: string; value: DayKey | null }[] = [
    { label: "Today", value: today },
    { label: "Tomorrow", value: addDays(today, 1) },
    { label: "Next week", value: addDays(today, 7) },
    { label: "No date", value: null },
  ];
  const matchesChip = options.some((o) => o.value === value);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 text-xs transition-all duration-500 ease-spring active:scale-[0.97] disabled:opacity-40 ${
              active ? "bg-ink text-paper" : "text-ink-soft ring-1 ring-ink/10 hover:text-ink hover:ring-ink/25"
            }`}
          >
            {o.label}
          </button>
        );
      })}
      <input
        type="date"
        aria-label="Pick a date"
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={`rounded-full bg-transparent px-3 py-1 text-xs outline-none ring-1 transition-all duration-500 ease-spring disabled:opacity-40 ${
          value && !matchesChip ? "text-ink ring-ink/40" : "text-muted ring-ink/10 hover:ring-ink/25"
        }`}
      />
    </div>
  );
}
