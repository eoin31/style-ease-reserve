import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Euro,
  LogOut,
  Phone,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  deleteBooking,
  getBookings,
  setBookingStatus,
  toISODate,
  type Booking,
  type BookingStatus,
} from "@/lib/bookings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { lockSalonAdmin, requireSalonAdmin } from "@/lib/salon-gate.functions";


export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Espace coiffeur — Maison Lumière" },
      {
        name: "description",
        content:
          "Espace coiffeur : consultez, acceptez, annulez ou supprimez les rendez-vous du salon Maison Lumière, avec vue calendrier.",
      },
      { property: "og:title", content: "Espace coiffeur — Maison Lumière" },
      {
        property: "og:description",
        content: "Gestion des rendez-vous du salon et vue calendrier.",
      },
    ],
  }),
  beforeLoad: async () => {
    await requireSalonAdmin();
  },
  component: Admin,
});


const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Accepté",
  cancelled: "Annulé",
};

function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const router = useRouter();
  const lock = useServerFn(lockSalonAdmin);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  async function onLogout() {
    await lock({});
    await router.invalidate();
    await router.navigate({ to: "/connexion" });
  }



  const today = toISODate(new Date());
  const sorted = useMemo(
    () => [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [bookings],
  );
  const todays = sorted.filter((b) => b.date === today);
  const upcoming = sorted.filter((b) => b.date > today);
  const past = sorted.filter((b) => b.date < today).reverse();
  const pending = sorted.filter((b) => b.status === "pending" && b.date >= today);
  const revenue = todays
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0);

  const actions = {
    accept: (id: string) => setBookings(setBookingStatus(id, "confirmed")),
    cancel: (id: string) => setBookings(setBookingStatus(id, "cancelled")),
    remove: (id: string) => setBookings(deleteBooking(id)),
  };

  return (
    <main className="mx-auto max-w-2xl px-6 pt-8 pb-16">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase"
        >
          <ArrowLeft className="h-4 w-4" /> Site
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Déconnexion
        </button>
      </div>
      <p className="eyebrow mt-6">Espace coiffeur</p>
      <h1 className="mt-2 text-3xl">Tableau de bord</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Session sécurisée — rendez-vous de démonstration.
      </p>


      <div className="mt-6 grid grid-cols-4 gap-3">
        <Stat icon={CalendarDays} label="Aujourd'hui" value={String(todays.length)} />
        <Stat icon={Users} label="À venir" value={String(upcoming.length)} />
        <Stat icon={Check} label="En attente" value={String(pending.length)} />
        <Stat icon={Euro} label="CA jour" value={`${revenue} €`} />
      </div>

      <Tabs defaultValue="today" className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1 text-xs">
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1 text-xs">
            À venir
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1 text-xs">
            Passés
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1 text-xs">
            Calendrier
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <BookingList items={todays} empty="Aucun rendez-vous aujourd'hui." actions={actions} />
        </TabsContent>
        <TabsContent value="upcoming">
          <BookingList
            items={upcoming}
            empty="Aucun rendez-vous à venir."
            showDate
            actions={actions}
          />
        </TabsContent>
        <TabsContent value="past">
          <BookingList items={past} empty="Aucun historique." showDate actions={actions} />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView bookings={sorted} actions={actions} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

type Actions = {
  accept: (id: string) => void;
  cancel: (id: string) => void;
  remove: (id: string) => void;
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-luxe">
      <Icon className="h-4 w-4 text-gold" />
      <p className="mt-2 font-display text-xl">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const tone =
    status === "confirmed"
      ? "border-gold/40 text-gold"
      : status === "cancelled"
        ? "border-destructive/40 text-destructive"
        : "border-border text-muted-foreground";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] tracking-wide ${tone}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function BookingList({
  items,
  empty,
  showDate,
  actions,
}: {
  items: Booking[];
  empty: string;
  showDate?: boolean;
  actions: Actions;
}) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {items.map((b) => (
        <li key={b.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 shrink-0 text-center">
              <p className="font-display text-lg text-gold">{b.time}</p>
              {showDate && (
                <p className="text-[10px] text-muted-foreground">
                  {new Date(b.date).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{b.firstName}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="truncate text-xs text-muted-foreground">{b.serviceName}</p>
              <a
                href={`tel:${b.phone.replace(/\s/g, "")}`}
                className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Phone className="h-3 w-3 text-gold" /> {b.phone}
              </a>
            </div>
            <span className="shrink-0 text-sm text-gold">{b.price} €</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent text-xs"
              disabled={b.status === "confirmed"}
              onClick={() => actions.accept(b.id)}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> Accepter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent text-xs"
              disabled={b.status === "cancelled"}
              onClick={() => actions.cancel(b.id)}
            >
              <X className="mr-1 h-3.5 w-3.5" /> Annuler
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label={`Supprimer le rendez-vous de ${b.firstName}`}
              className="text-destructive"
              onClick={() => actions.remove(b.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function CalendarView({ bookings, actions }: { bookings: Booking[]; actions: Actions }) {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(toISODate(now));

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((b) => map.set(b.date, (map.get(b.date) ?? 0) + 1));
    return map;
  }, [bookings]);

  const dayBookings = bookings.filter((b) => b.date === selected);

  return (
    <div className="mt-4">
      <div className="rounded-lg border border-border bg-card p-4 shadow-luxe">
        <div className="flex items-center justify-between">
          <button
            aria-label="Mois précédent"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="font-display text-lg capitalize">
            {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </p>
          <button
            aria-label="Mois suivant"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = new Date(month.getFullYear(), month.getMonth(), i + 1);
            const iso = toISODate(date);
            const count = counts.get(iso) ?? 0;
            const isSelected = iso === selected;
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`flex aspect-square flex-col items-center justify-center rounded-md border text-xs transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-border/60 text-foreground hover:border-gold/50"
                }`}
              >
                {i + 1}
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${count > 0 ? "bg-gold" : "bg-transparent"}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-xs tracking-widest text-muted-foreground uppercase">
        {new Date(selected).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </p>
      <BookingList
        items={dayBookings}
        empty="Aucun rendez-vous ce jour-là."
        actions={actions}
      />
    </div>
  );
}
