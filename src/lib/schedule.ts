import { toISODate } from "@/lib/bookings";

export type DaySchedule = {
  /** 0 = dimanche */
  weekday: number;
  label: string;
  open: boolean;
  start: string; // HH:mm
  end: string; // HH:mm
  breakStart: string; // HH:mm ("" = pas de pause)
  breakEnd: string;
};

export type TimeOff = {
  id: string;
  label: string;
  from: string; // yyyy-MM-dd
  to: string; // yyyy-MM-dd
};

export type Schedule = {
  days: DaySchedule[];
  timeOff: TimeOff[];
};

const KEY = "maison-lumiere-schedule";

export const WEEKDAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

export const DEFAULT_SCHEDULE: Schedule = {
  days: [
    { weekday: 1, label: "Lundi", open: false, start: "09:00", end: "19:00", breakStart: "", breakEnd: "" },
    { weekday: 2, label: "Mardi", open: true, start: "09:00", end: "19:00", breakStart: "13:00", breakEnd: "14:00" },
    { weekday: 3, label: "Mercredi", open: true, start: "09:00", end: "19:00", breakStart: "13:00", breakEnd: "14:00" },
    { weekday: 4, label: "Jeudi", open: true, start: "09:00", end: "20:00", breakStart: "13:00", breakEnd: "14:00" },
    { weekday: 5, label: "Vendredi", open: true, start: "09:00", end: "20:00", breakStart: "13:00", breakEnd: "14:00" },
    { weekday: 6, label: "Samedi", open: true, start: "09:00", end: "18:00", breakStart: "", breakEnd: "" },
    { weekday: 0, label: "Dimanche", open: false, start: "10:00", end: "17:00", breakStart: "", breakEnd: "" },
  ],
  timeOff: [],
};

export function getSchedule(): Schedule {
  if (typeof window === "undefined") return DEFAULT_SCHEDULE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SCHEDULE;
    const parsed = JSON.parse(raw) as Schedule;
    if (!parsed?.days?.length) return DEFAULT_SCHEDULE;
    return { days: parsed.days, timeOff: parsed.timeOff ?? [] };
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

export function saveSchedule(schedule: Schedule): Schedule {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(schedule));
  }
  return schedule;
}

export function dayFor(schedule: Schedule, date: Date): DaySchedule | undefined {
  return schedule.days.find((d) => d.weekday === date.getDay());
}

export function isTimeOff(schedule: Schedule, date: Date): TimeOff | undefined {
  const iso = toISODate(date);
  return schedule.timeOff.find((t) => iso >= t.from && iso <= t.to);
}

export function isDayClosed(schedule: Schedule, date: Date): boolean {
  const day = dayFor(schedule, date);
  if (!day || !day.open) return true;
  return Boolean(isTimeOff(schedule, date));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m ?? 0);
}

function fromMinutes(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Créneaux de 30 min selon les horaires du coiffeur, pauses et congés exclus. */
export function scheduleSlots(schedule: Schedule, date: Date): string[] {
  if (isDayClosed(schedule, date)) return [];
  const day = dayFor(schedule, date)!;
  const start = toMinutes(day.start);
  const end = toMinutes(day.end);
  const hasBreak = Boolean(day.breakStart && day.breakEnd);
  const bStart = hasBreak ? toMinutes(day.breakStart) : 0;
  const bEnd = hasBreak ? toMinutes(day.breakEnd) : 0;

  const slots: string[] = [];
  for (let t = start; t + 30 <= end; t += 30) {
    if (hasBreak && t < bEnd && t + 30 > bStart) continue;
    slots.push(fromMinutes(t));
  }
  return slots;
}

export function dayHoursLabel(day: DaySchedule): string {
  if (!day.open) return "Fermé";
  const base = `${day.start} – ${day.end}`;
  if (day.breakStart && day.breakEnd) {
    return `${day.start} – ${day.breakStart} · ${day.breakEnd} – ${day.end}`;
  }
  return base;
}

export function formatRange(t: TimeOff): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  return t.from === t.to ? fmt(t.from) : `${fmt(t.from)} → ${fmt(t.to)}`;
}
