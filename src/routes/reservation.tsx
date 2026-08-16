import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICES, isClosed, slotsForDate, type Service } from "@/lib/salon-data";
import { addBooking, takenSlots, toISODate, type Booking } from "@/lib/bookings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reservation")({
  head: () => ({
    meta: [
      { title: "Prendre rendez-vous — Maison Lumière" },
      {
        name: "description",
        content:
          "Réservez votre coupe, couleur ou soin chez Maison Lumière : choisissez la prestation, la date et le créneau en quelques secondes.",
      },
      { property: "og:title", content: "Prendre rendez-vous — Maison Lumière" },
      {
        property: "og:description",
        content: "Réservation en ligne en 3 étapes, sans paiement en ligne.",
      },
    ],
  }),
  component: Reservation,
});

const contactSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Prénom trop court")
    .max(50, "Prénom trop long"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4}$/, "Numéro de téléphone invalide"),
});

function nextDays(count: number) {
  const days: Date[] = [];
  const d = new Date();
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    if (!isClosed(d)) days.push(new Date(d));
  }
  return days;
}

function Reservation() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ firstName?: string | undefined; phone?: string | undefined }>({});
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const days = useMemo(() => nextDays(14), []);
  const slots = useMemo(() => {
    if (!date) return [];
    const taken = takenSlots(toISODate(date));
    return slotsForDate(date).map((s) => ({ time: s, taken: taken.includes(s) }));
  }, [date]);

  function submit() {
    const result = contactSchema.safeParse({ firstName, phone });
    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setErrors({ firstName: f.firstName?.[0], phone: f.phone?.[0] });
      return;
    }
    if (!service || !date || !time) return;
    const booking = addBooking({
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
      date: toISODate(date),
      time,
      firstName: result.data.firstName,
      phone: result.data.phone,
    });
    setConfirmed(booking);
  }

  if (confirmed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-gold" />
        <h1 className="mt-6 text-3xl">Rendez-vous confirmé</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Merci {confirmed.firstName}, nous vous attendons chez Maison Lumière. Un SMS de rappel
          sera envoyé au {confirmed.phone}.
        </p>
        <div className="mt-8 rounded-lg border border-border bg-card p-5 text-left shadow-luxe">
          <Row label="Prestation" value={confirmed.serviceName} />
          <Row label="Date" value={formatLong(confirmed.date)} />
          <Row label="Heure" value={confirmed.time} />
          <Row label="À régler sur place" value={`${confirmed.price} €`} />
        </div>
        <Button asChild variant="outline" className="mt-8 h-12 bg-transparent">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-8 pb-20">
      <div className="flex items-center justify-between">
        {step === 1 ? (
          <Link
            to="/"
            className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Accueil
          </Link>
        ) : (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase"
          >
            <ArrowLeft className="h-4 w-4" /> Retour
          </button>
        )}
        <span className="text-xs tracking-widest text-gold uppercase">Étape {step}/3</span>
      </div>

      <div className="mt-4 flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-0.5 flex-1 rounded-full",
              i <= step ? "bg-gold" : "bg-border",
            )}
          />
        ))}
      </div>

      {step === 1 && (
        <section className="mt-8">
          <h1 className="text-3xl">Votre prestation</h1>
          <ul className="mt-6 space-y-3">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setService(s);
                    setStep(2);
                  }}
                  className={cn(
                    "w-full rounded-lg border bg-card p-4 text-left transition-colors",
                    service?.id === s.id
                      ? "border-gold"
                      : "border-border hover:border-gold-soft",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.duration} min</p>
                    </div>
                    <span className="font-display text-lg text-gold">{s.price} €</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8">
          <h1 className="text-3xl">Date & créneau</h1>
          <p className="mt-2 text-xs text-muted-foreground">{service?.name}</p>

          <div className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-2">
            {days.map((d) => {
              const active = date && toISODate(d) === toISODate(date);
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => {
                    setDate(d);
                    setTime(null);
                  }}
                  className={cn(
                    "min-w-16 shrink-0 rounded-lg border px-3 py-2.5 text-center",
                    active ? "border-gold bg-secondary" : "border-border bg-card",
                  )}
                >
                  <span className="block text-[10px] tracking-wider text-muted-foreground uppercase">
                    {d.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </span>
                  <span className="block font-display text-xl">{d.getDate()}</span>
                  <span className="block text-[10px] text-muted-foreground">
                    {d.toLocaleDateString("fr-FR", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>

          {date && (
            <>
              <p className="mt-6 eyebrow">Créneaux disponibles</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.taken}
                    onClick={() => setTime(s.time)}
                    className={cn(
                      "rounded-md border py-2.5 text-sm transition-colors",
                      s.taken && "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through",
                      !s.taken && time === s.time
                        ? "border-gold bg-secondary text-gold"
                        : !s.taken && "border-border bg-card hover:border-gold-soft",
                    )}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            </>
          )}

          <Button
            disabled={!date || !time}
            onClick={() => setStep(3)}
            size="lg"
            className="mt-8 h-12 w-full text-sm tracking-widest uppercase"
          >
            Continuer
          </Button>
        </section>
      )}

      {step === 3 && (
        <section className="mt-8">
          <h1 className="text-3xl">Vos coordonnées</h1>
          <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
            <Row label="Prestation" value={service?.name ?? ""} />
            <Row label="Date" value={date ? formatLong(toISODate(date)) : ""} />
            <Row label="Heure" value={time ?? ""} />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                maxLength={50}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Camille"
                className="mt-1.5 h-12"
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                maxLength={20}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
                className="mt-1.5 h-12"
              />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
          </div>

          <Button
            onClick={submit}
            size="lg"
            className="mt-8 h-12 w-full text-sm tracking-widest uppercase"
          >
            <Check className="mr-2 h-4 w-4" /> Confirmer le rendez-vous
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Aucun paiement en ligne · règlement au salon
          </p>
        </section>
      )}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatLong(iso: string) {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
