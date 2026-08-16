export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  firstName: string;
  phone: string;
  createdAt: string;
  status: BookingStatus;
};

const KEY = "maison-lumiere-bookings";

const SEED: Booking[] = [
  {
    id: "seed-1",
    serviceId: "balayage",
    serviceName: "Balayage lumière",
    price: 110,
    date: todayISO(),
    time: "10:00",
    firstName: "Camille",
    phone: "06 12 45 78 90",
    createdAt: new Date().toISOString(),
    status: "confirmed",
  },
  {
    id: "seed-2",
    serviceId: "coupe-homme",
    serviceName: "Coupe homme",
    price: 32,
    date: todayISO(),
    time: "14:30",
    firstName: "Yanis",
    phone: "07 88 21 03 44",
    createdAt: new Date().toISOString(),
    status: "confirmed",
  },
  {
    id: "seed-3",
    serviceId: "couleur",
    serviceName: "Couleur & racines",
    price: 62,
    date: addDaysISO(1),
    time: "11:30",
    firstName: "Sofia",
    phone: "06 71 09 55 12",
    createdAt: new Date().toISOString(),
    status: "pending",
  },
  {
    id: "seed-4",
    serviceId: "soin",
    serviceName: "Soin profond kératine",
    price: 35,
    date: addDaysISO(2),
    time: "16:00",
    firstName: "Léa",
    phone: "06 34 77 18 02",
    createdAt: new Date().toISOString(),
    status: "pending",
  },
];

export function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayISO() {
  return toISODate(new Date());
}

function addDaysISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      window.localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as Booking[];
  } catch {
    return SEED;
  }
}

export function addBooking(
  b: Omit<Booking, "id" | "createdAt" | "status"> & { status?: BookingStatus },
): Booking {
  const booking: Booking = {
    status: "pending",
    ...b,
    id: `bk-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const all = [...getBookings(), booking];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
  return booking;
}

function save(all: Booking[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
}

export function setBookingStatus(id: string, status: BookingStatus): Booking[] {
  const all = getBookings().map((b) => (b.id === id ? { ...b, status } : b));
  save(all);
  return all;
}

export function deleteBooking(id: string): Booking[] {
  const all = getBookings().filter((b) => b.id !== id);
  save(all);
  return all;
}

export function takenSlots(dateISO: string): string[] {
  return getBookings()
    .filter((b) => b.date === dateISO && b.status !== "cancelled")
    .map((b) => b.time);
}
