import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, Scissors, Sparkles, Star } from "lucide-react";
import heroImage from "@/assets/salon-hero.jpg";
import { Button } from "@/components/ui/button";
import { SALON, SERVICES } from "@/lib/salon-data";
import { OpeningHours } from "@/components/opening-hours";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Maison Lumière — Salon de coiffure à Paris" },
      {
        name: "description",
        content:
          "Salon de coiffure et studio couleur à Paris. Coupe, balayage, soins. Réservez votre rendez-vous en ligne en moins d'une minute.",
      },
      { property: "og:title", content: "Maison Lumière — Salon de coiffure à Paris" },
      {
        property: "og:description",
        content: "Coupe, couleur, balayage et soins. Prenez rendez-vous en ligne en 3 étapes.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Intérieur du salon de coiffure Maison Lumière"
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />

        <div className="relative mx-auto max-w-2xl px-6 pt-20 pb-16 text-center">
          <p className="eyebrow">{SALON.tagline}</p>
          <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
            <span className="text-gradient-gold">Maison</span>
            <br />
            Lumière
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Coupe sur mesure, couleur lumineuse et soins d'exception. Un savoir-faire d'atelier au
            cœur de Paris.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Button asChild size="lg" className="h-12 text-sm tracking-widest uppercase">
              <Link to="/reservation">Prendre rendez-vous</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 bg-transparent">
              <a href={`tel:${SALON.phone.replace(/\s/g, "")}`}>
                <Phone className="mr-2 h-4 w-4" /> {SALON.phone}
              </a>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="flex text-gold">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            4,9 · 412 avis clients
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="mx-auto max-w-2xl px-6 py-14">
        <p className="eyebrow">Le salon</p>
        <h2 className="mt-3 text-3xl">Un atelier dédié à la lumière du cheveu</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Depuis 2014, notre équipe de six artisans coiffeurs façonne des coupes qui vivent avec
          vous. Diagnostic personnalisé, produits végétaux et techniques de couleur main levée :
          chaque rendez-vous commence par une écoute, jamais par un catalogue.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Scissors, label: "Coupe sur mesure" },
            { icon: Sparkles, label: "Couleur végétale" },
            { icon: Clock, label: "Sans attente" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-lg border border-border bg-card p-4 text-center shadow-luxe"
            >
              <Icon className="mx-auto h-5 w-5 text-gold" />
              <p className="mt-2 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prestations */}
      <section className="mx-auto max-w-2xl px-6 pb-14">
        <p className="eyebrow">Prestations</p>
        <h2 className="mt-3 text-3xl">Carte & tarifs</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {SERVICES.map((s) => (
            <li key={s.id} className="flex items-start justify-between gap-4 py-4">
              <div>
                <h3 className="font-sans text-sm font-medium tracking-wide">{s.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{s.duration} min</p>
              </div>
              <span className="shrink-0 font-display text-xl text-gold">{s.price} €</span>
            </li>
          ))}
        </ul>
        <Button asChild size="lg" className="mt-8 h-12 w-full text-sm tracking-widest uppercase">
          <Link to="/reservation">Prendre rendez-vous</Link>
        </Button>
      </section>

      {/* Horaires */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <p className="eyebrow">Horaires</p>
        <h2 className="mt-3 text-3xl">Nous vous accueillons</h2>
        <OpeningHours />
        <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-gold" /> {SALON.address}
        </p>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <p className="font-display text-lg text-foreground">{SALON.name}</p>
        <p className="mt-2">{SALON.address}</p>
        <Link to="/admin" className="mt-4 inline-block underline underline-offset-4">
          Espace coiffeur
        </Link>
      </footer>
    </main>
  );
}
