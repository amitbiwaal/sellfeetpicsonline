"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";

const STORAGE_KEY = "sfo-analytics-consent";
type Consent = "granted" | "denied" | null;

const listeners = new Set<() => void>();
let memoryConsent: Consent = null;

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(value: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // storage unavailable: the choice lasts for this page view only
  }
  memoryConsent = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Google Analytics 4, loaded only after the visitor accepts analytics cookies. */
export function Analytics({ measurementId }: { measurementId: string }) {
  const consent = useSyncExternalStore(
    subscribe,
    () => memoryConsent ?? readConsent(),
    () => "pending" as const,
  );

  if (!/^G-[A-Z0-9]+$/i.test(measurementId)) return null;
  if (consent === "pending") return null;

  if (consent === "granted") {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}',{anonymize_ip:true});`}
        </Script>
      </>
    );
  }

  if (consent === "denied") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-[0_20px_50px_-20px_rgba(61,15,40,0.45)] sm:p-5"
    >
      <p className="text-sm leading-relaxed text-body">
        We use analytics cookies to see which guides are most helpful. No ads, no selling data.{" "}
        <Link href="/cookie-policy/" className="font-semibold text-brand underline underline-offset-2">
          Cookie policy
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => writeConsent("granted")}>
          Accept
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => writeConsent("denied")}>
          Decline
        </button>
      </div>
    </div>
  );
}
