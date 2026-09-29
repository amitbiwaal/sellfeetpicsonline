import { SignJWT, jwtVerify } from "jose";

/**
 * Session token helpers. Kept free of "server-only" so the proxy (which
 * guards /admin) can use them too.
 */
export const SESSION_COOKIE = "sfo_session";
export const SESSION_DAYS = 7;

export type SessionPayload = { uid: number; role: "admin" | "editor"; ver: number };

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me-please-0123456789";
let warned = false;

function secretKey() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters. Set it in your environment variables.");
  }
  if (!warned) {
    console.warn("[auth] SESSION_SECRET is not set; using an insecure development secret. Run `npm run setup`.");
    warned = true;
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "number") return null;
    return {
      uid: payload.uid,
      role: payload.role === "editor" ? "editor" : "admin",
      ver: typeof payload.ver === "number" ? payload.ver : 0,
    };
  } catch {
    return null;
  }
}
