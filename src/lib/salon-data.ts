export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  category: "Coupe" | "Couleur" | "Soin" | "Barbe";
};

export const SALON = {
  name: "Maison Lumière",
  tagline: "Salon de coiffure & studio couleur",
  address: "12 rue des Orfèvres, 75002 Paris",
  phone: "01 45 78 22 10",
};

export const SERVICES: Service[] = [
  {
    id: "coupe-femme",
    name: "Coupe femme",
    description: "Diagnostic, shampoing, coupe sur mesure et coiffage.",
    price: 45,
    duration: 45,
    category: "Coupe",
  },
  {
    id: "coupe-homme",
    name: "Coupe homme",
    description: "Coupe ciseaux ou tondeuse, finitions et coiffage.",
    price: 32,
    duration: 30,
    category: "Coupe",
  },
  {
    id: "brushing",
    name: "Brushing signature",
    description: "Volume et brillance, tenue longue durée.",
    price: 28,
    duration: 30,
    category: "Coupe",
  },
  {
    id: "couleur",
    name: "Couleur & racines",
    description: "Coloration ton sur ton ou couverture des cheveux blancs.",
    price: 62,
    duration: 75,
    category: "Couleur",
  },
  {
    id: "balayage",
    name: "Balayage lumière",
    description: "Éclaircissement main levée, patine et soin.",
    price: 110,
    duration: 120,
    category: "Couleur",
  },
  {
    id: "soin",
    name: "Soin profond kératine",
    description: "Rituel réparateur, massage du cuir chevelu.",
    price: 35,
    duration: 30,
    category: "Soin",
  },
  {
    id: "barbe",
    name: "Taille de barbe",
    description: "Contours à la serviette chaude et huile nourrissante.",
    price: 20,
    duration: 20,
    category: "Barbe",
  },
];

export const OPENING_HOURS = [
  { day: "Lundi", hours: "Fermé" },
  { day: "Mardi", hours: "09:00 – 19:00" },
  { day: "Mercredi", hours: "09:00 – 19:00" },
  { day: "Jeudi", hours: "09:00 – 20:00" },
  { day: "Vendredi", hours: "09:00 – 20:00" },
  { day: "Samedi", hours: "09:00 – 18:00" },
  { day: "Dimanche", hours: "Fermé" },
];

// 0 = dimanche
const CLOSED_DAYS = [0, 1];

export function isClosed(date: Date) {
  return CLOSED_DAYS.includes(date.getDay());
}

export function slotsForDate(date: Date): string[] {
  if (isClosed(date)) return [];
  const lateDays = [4, 5];
  const end = lateDays.includes(date.getDay()) ? 20 : date.getDay() === 6 ? 18 : 19;
  const slots: string[] = [];
  for (let h = 9; h < end; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}
