import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Euro, Phone, Users } from "lucide-react";
import { getBookings, toISODate, type Booking } from "@/lib/bookings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Tableau de bord coiffeur — Maison Lumière" },
      {
        name: "description",
        content:
          "Espace coiffeur : consultez les rendez-vous du jour, à venir et l'historique du salon Maison Lumière.",
      },
      { property: "og:title", content: "Tableau de bord coiffeur — Maison Lumière" },
      {
        property: "og:description",
        content: "Vue d'ensemble des rendez-vous du salon.",
      },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  const today = toISODate(new Date());
  const sorted = useMemo(
    () => [...bookings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [bookings],
  );
  const todays = sorted.filter((b) => b.date === today);
  const upcoming = sorted.filter((b) => b.date > today);
  const past = sorted.filter((b) => b.date < today).reverse();
  const revenue = todays.reduce((sum, b) => sum + b.price, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 pt-8 pb-16">
      <Link
        to="/"
        className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase"
      >
        <ArrowLeft className="h-4 w-4" /> Site
      </Link>
      <p className="eyebrow mt-6">Espace coiffeur</p>
      <h1 className="mt-2 text-3xl">Tableau de bord</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat icon={CalendarDays} label="Aujourd'hui" value={String(todays.length)} />
        <Stat icon={Users} label="À venir" value={String(upcoming.length)} />
        <Stat icon={Euro} label="CA du jour" value={`${revenue} €`} />
      </div>

      <Tabs defaultValue="today" className="mt-8">
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">
            Aujourd'hui
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            À venir
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            Passés
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today">
          <BookingList items={todays} empty="Aucun rendez-vous aujourd'hui." />
        </TabsContent>
        <TabsContent value="upcoming">
          <BookingList items={upcoming} empty="Aucun rendez-vous à venir." showDate />
        </TabsContent>
        <TabsContent value="past">
          <BookingList items={past} empty="Aucun historique." showDate />
        </TabsContent>
      </Tabs>
    </main>
  );
}

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
    <div className="rounded-lg border border-border bg-card p-4 shadow-luxe">
      <Icon className="h-4 w-4 text-gold" />
      <p className="mt-2 font-display text-2xl">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function BookingList({
  items,
  empty,
  showDate,
}: {
  items: Booking[];
  empty: string;
  showDate?: boolean;
}) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {items.map((b) => (
        <li
          key={b.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
        >
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
            <p className="truncate text-sm font-medium">{b.firstName}</p>
            <p className="truncate text-xs text-muted-foreground">{b.serviceName}</p>
            <a
              href={`tel:${b.phone.replace(/\s/g, "")}`}
              className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Phone className="h-3 w-3 text-gold" /> {b.phone}
            </a>
          </div>
          <span className="shrink-0 text-sm text-gold">{b.price} €</span>
        </li>
      ))}
    </ul>
  );
}
