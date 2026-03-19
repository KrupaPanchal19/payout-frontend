import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/domain/types";

const COOKIE_NAME = "cord4_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export type SessionUser = {
  role: Role;
  label: string;
};

export async function setSession(user: SessionUser) {
  const token = await new SignJWT({ role: user.role, label: user.label })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;
    const label = payload.label;
    if (role !== "OPS" && role !== "FINANCE") return null;
    if (typeof label !== "string") return null;
    return { role, label };
  } catch {
    return null;
  }
}

export async function requireRole(allowed: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false as const, status: 401, error: "UNAUTHENTICATED" };
  }
  if (!allowed.includes(user.role)) {
    return { ok: false as const, status: 403, error: "FORBIDDEN" };
  }
  return { ok: true as const, user };
}

