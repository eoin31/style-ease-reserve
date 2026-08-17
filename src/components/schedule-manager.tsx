import { useEffect, useState } from "react";
import { Plus, Trash2, Coffee, Palmtree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SCHEDULE,
  formatRange,
  getSchedule,
  saveSchedule,
  type DaySchedule,
  type Schedule,
} from "@/lib/schedule";
import { toISODate } from "@/lib/bookings";

export function ScheduleManager() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState("");
  const [from, setFrom] = useState(toISODate(new Date()));
  const [to, setTo] = useState(toISODate(new Date()));

  useEffect(() => {
    setSchedule(getSchedule());
  }, []);

  function update(next: Schedule) {
    setSchedule(saveSchedule(next));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  function updateDay(weekday: number, patch: Partial<DaySchedule>) {
    update({
      ...schedule,
      days: schedule.days.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)),
    });
  }

  function addTimeOff() {
    if (!from || !to || to < from) return;
    update({
      ...schedule,
      timeOff: [
        ...schedule.timeOff,
        { id: `off-${Date.now()}`, label: label.trim() || "Congés", from, to },
      ].sort((a, b) => a.from.localeCompare(b.from)),
    });
    setLabel("");
  }

  return (
    <div className="mt-4 space-y-8">
      <section>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Jours & horaires de travail</p>
          {saved && <span className="text-[10px] text-gold">Enregistré</span>}
        </div>
        <ul className="mt-3 space-y-3">
          {schedule.days.map((d) => (
            <li key={d.weekday} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{d.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {d.open ? "Ouvert" : "Fermé"}
                  </span>
                  <Switch
                    checked={d.open}
                    aria-label={`Travailler le ${d.label}`}
                    onCheckedChange={(open) => updateDay(d.weekday, { open })}
                  />
                </div>
              </div>

              {d.open && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Début</Label>
                      <Input
                        type="time"
                        value={d.start}
                        step={1800}
                        onChange={(e) => updateDay(d.weekday, { start: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Fin</Label>
                      <Input
                        type="time"
                        value={d.end}
                        step={1800}
                        onChange={(e) => updateDay(d.weekday, { end: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Coffee className="h-3 w-3 text-gold" /> Pause de
                      </Label>
                      <Input
                        type="time"
                        value={d.breakStart}
                        step={1800}
                        onChange={(e) => updateDay(d.weekday, { breakStart: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Pause à</Label>
                      <Input
                        type="time"
                        value={d.breakEnd}
                        step={1800}
                        onChange={(e) => updateDay(d.weekday, { breakEnd: e.target.value })}
                        className="mt-1 h-10"
                      />
                    </div>
                  </div>
                  {(d.breakStart || d.breakEnd) && (
                    <button
                      onClick={() => updateDay(d.weekday, { breakStart: "", breakEnd: "" })}
                      className="text-[10px] tracking-wide text-muted-foreground underline underline-offset-4"
                    >
                      Retirer la pause
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="eyebrow flex items-center gap-1.5">
          <Palmtree className="h-3.5 w-3.5 text-gold" /> Congés & fermetures
        </p>

        <div className="mt-3 rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] text-muted-foreground">Du</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">Au</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 h-10"
              />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-[10px] text-muted-foreground">Motif (optionnel)</Label>
            <Input
              value={label}
              maxLength={40}
              placeholder="Vacances d'été"
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <Button onClick={addTimeOff} className="mt-4 h-11 w-full text-xs tracking-widest uppercase">
            <Plus className="mr-1 h-4 w-4" /> Ajouter
          </Button>
        </div>

        {schedule.timeOff.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Aucun congé programmé.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {schedule.timeOff.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{formatRange(t)}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Supprimer ${t.label}`}
                  className="text-destructive"
                  onClick={() =>
                    update({ ...schedule, timeOff: schedule.timeOff.filter((x) => x.id !== t.id) })
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">
          Ces horaires, pauses et congés s'appliquent immédiatement aux créneaux proposés aux
          clients sur le site.
        </p>
      </section>
    </div>
  );
}
