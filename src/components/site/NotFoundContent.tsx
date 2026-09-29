import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchForm } from "@/components/blog/BlogListing";
import { Container } from "@/components/ui/Container";

const POPULAR = [
  { label: "Best platforms to sell feet pics", href: "/best-platforms/" },
  { label: "Safety tips", href: "/safety-tips/" },
  { label: "All articles", href: "/blog/" },
  { label: "How to get started", href: "/#start" },
];

export function NotFoundContent() {
  return (
    <div className="bg-[linear-gradient(180deg,#fff5f8_0%,#ffffff_100%)]">
      <Container className="py-20 text-center md:py-28">
        <p className="text-gradient font-serif text-[88px] leading-none font-semibold md:text-[120px]">404</p>
        <h1 className="mt-4 font-serif text-3xl font-semibold text-ink md:text-4xl">This page took a wrong step</h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Try searching, or pick one of our most popular
          guides.
        </p>
        <SearchForm className="mt-8" />
        <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {POPULAR.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-muted-2 transition-colors hover:border-brand-light hover:text-brand"
              >
                {item.label} <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn btn-primary mt-10">
          Back to home
        </Link>
      </Container>
    </div>
  );
}
