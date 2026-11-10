import { cookies } from "next/headers";
import crypto from "crypto";
import { UserProfile } from "@/types";

const SESSION_COOKIE_NAME = "obhijaan_session";

// SESSION_SECRET must be a fixed string — NEVER generate it at runtime.
// A runtime-generated secret is wiped on every Next.js hot-reload,
// instantly invalidating all sessions. Use a stable value from .env.local.
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "obhijaan_fallback_dev_secret_CHANGE_IN_PROD";

export interface SessionPayload {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  preferredCurrency?: string;
  role?: string;
  iat: number;
  exp: number;
}

export function signSessionToken(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const b64Data = Buffer.from(json, "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(b64Data)
    .digest("base64url");
  return `${b64Data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [b64Data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(b64Data)
      .digest("base64url");
    const sigBuf = Buffer.from(signature, "base64url");
    const expectedBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
    const json = Buffer.from(b64Data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserProfile): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = 60 * 60 * 24 * 14; // 14 days
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || user.email?.split("@")[0] || "Competitor",
    photoURL: user.photoURL || null,
    preferredCurrency: user.preferredCurrency || "USD",
    role: user.role || "competitor",
    iat: now,
    exp: now + maxAge,
  };
  const token = signSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function getSessionUser(): Promise<UserProfile | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;
    const payload = verifySessionToken(cookie.value);
    if (!payload) return null;
    return {
      uid: payload.uid,
      email: payload.email,
      displayName: payload.displayName,
      photoURL: payload.photoURL || undefined,
      preferredCurrency: payload.preferredCurrency,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // ignore
  }
}
