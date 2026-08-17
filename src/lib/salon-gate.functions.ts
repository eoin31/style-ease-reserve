import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

type GateSession = { unlocked?: boolean };

export const unlockSalonAdmin = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => ({ password: String(data.password ?? "") }))
  .handler(async ({ data }) => {
    const { createHash, timingSafeEqual } = await import("node:crypto");
    const expected = process.env["SALON_ADMIN_PASSWORD"];
    if (!expected) throw new Error("SALON_ADMIN_PASSWORD is not set");
    const inputHash = createHash("sha256").update(data.password, "utf8").digest();
    const expectedHash = createHash("sha256").update(expected, "utf8").digest();
    if (!data.password || !timingSafeEqual(inputHash, expectedHash)) {
      return { ok: false as const };
    }
    const session = await useSession<GateSession>({
      password: process.env["SESSION_SECRET"]!,
      name: "salon-gate",
      maxAge: 60 * 60 * 12,
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        partitioned: true,
        path: "/",
      },
    });
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSalonAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>({
    password: process.env["SESSION_SECRET"]!,
    name: "salon-gate",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
    },
  });
  await session.clear();
  return { ok: true as const };
});

export const isSalonAdminUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>({
    password: process.env["SESSION_SECRET"]!,
    name: "salon-gate",
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      partitioned: true,
      path: "/",
    },
  });
  return { unlocked: session.data.unlocked === true };
});
