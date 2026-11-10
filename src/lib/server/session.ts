import { cookies } from "next/headers";
import crypto from "crypto";
import { UserProfile } from "@/types";

const SESSION_COOKIE_NAME = "obhijaan_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "obhijaan_default_server_security_salt_change_in_env_2026";

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

/**
 * Mint a cryptographic HMAC-SHA256 signed session token.
 */
export function signSessionToken(payload: SessionPayload): string {
  const json = JSON.stringify(payload);
  const b64Data = Buffer.from(json, "utf-8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(b64Data)
    .digest("base64url");
  return `${b64Data}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 session token.
 * Prevents tampering and timing attacks.
 */
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

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const json = Buffer.from(b64Data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);

    // Check expiration (in seconds)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Sets an HTTP-only secure session cookie in the Next.js response.
 */
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

/**
 * Reads and validates the current active session user from cookies.
 */
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
  } catch (err) {
    return null;
  }
}

/**
 * Deletes the session cookie on user logout.
 */
export async function clearSessionCookie(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    // Ignore error
  }
}
