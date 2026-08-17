import { useEffect, useState } from "react";
import { Palmtree } from "lucide-react";
import {
  DEFAULT_SCHEDULE,
  dayHoursLabel,
  formatRange,
  getSchedule,
  type Schedule,
} from "@/lib/schedule";
import { toISODate } from "@/lib/bookings";

export function OpeningHours() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);

  useEffect(() => {
    setSchedule(getSchedule());
  }, []);

  const today = toISODate(new Date());
  const upcomingTimeOff = schedule.timeOff.filter((t) => t.to >= today);

  return (
    <>
      <ul className="mt-6 rounded-lg border border-border bg-card shadow-luxe">
        {schedule.days.map((d) => {
          const hours = dayHoursLabel(d);
          return (
            <li
              key={d.weekday}
              className="flex justify-between gap-4 border-b border-border px-4 py-3 text-sm last:border-0"
            >
              <span className="text-muted-foreground">{d.label}</span>
              <span className={d.open ? "text-right text-gold" : "text-muted-foreground/60"}>
                {hours}
              </span>
            </li>
          );
        })}
      </ul>

      {upcomingTimeOff.length > 0 && (
        <div className="mt-4 rounded-lg border border-gold/30 bg-secondary/50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs tracking-widest text-gold uppercase">
            <Palmtree className="h-3.5 w-3.5" /> Fermetures à venir
          </p>
          <ul className="mt-2 space-y-1">
            {upcomingTimeOff.map((t) => (
              <li key={t.id} className="flex justify-between text-sm text-muted-foreground">
                <span>{t.label}</span>
                <span>{formatRange(t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
