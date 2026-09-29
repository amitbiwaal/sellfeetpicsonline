"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="text-xs font-bold tracking-[0.16em] text-brand uppercase">Something went wrong</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-ink md:text-4xl">We couldn&apos;t load this page</h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Please try again. If the problem continues, come back in a few minutes.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-secondary">
          Go home
        </Link>
      </div>
    </Container>
  );
}
