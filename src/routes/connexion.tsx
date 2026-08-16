import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unlockSalonAdmin } from "@/lib/salon-gate.functions";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion coiffeur — Maison Lumière" },
      {
        name: "description",
        content:
          "Accès sécurisé à l'espace coiffeur du salon Maison Lumière. Saisissez le mot de passe du salon pour consulter les rendez-vous.",
      },
      { property: "og:title", content: "Connexion coiffeur — Maison Lumière" },
      {
        property: "og:description",
        content: "Accès réservé à l'équipe du salon Maison Lumière.",
      },
    ],
  }),
  component: Connexion,
});

function Connexion() {
  const router = useRouter();
  const unlock = useServerFn(unlockSalonAdmin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const { ok } = await unlock({ data: { password } });
    setLoading(false);
    if (ok) {
      await router.invalidate();
      await router.navigate({ to: "/admin" });
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-8 pb-16">
      <Link
        to="/"
        className="flex items-center gap-2 text-xs tracking-widest text-muted-foreground uppercase"
      >
        <ArrowLeft className="h-4 w-4" /> Site
      </Link>

      <div className="mt-10 rounded-lg border border-border bg-card p-6 shadow-luxe">
        <Lock className="h-5 w-5 text-gold" />
        <h1 className="mt-4 text-3xl">Espace coiffeur</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accès réservé à l'équipe du salon. Saisissez le mot de passe.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs tracking-widest uppercase">
              Mot de passe
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-destructive">Mot de passe incorrect.</p>}
          <Button
            type="submit"
            size="lg"
            disabled={loading || password.length === 0}
            className="h-12 w-full text-sm tracking-widest uppercase"
          >
            {loading ? "Vérification…" : "Se connecter"}
          </Button>
        </form>
      </div>
    </main>
  );
}
