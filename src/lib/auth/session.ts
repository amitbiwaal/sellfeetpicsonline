import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_DAYS, signSessionToken, verifySessionToken, type SessionPayload } from "./jwt";

function shouldUseSecureCookie() {
  // Secure cookies need HTTPS. INSECURE_COOKIES=true allows testing a production build over plain HTTP.
  return process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true";
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = await signSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function readSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
