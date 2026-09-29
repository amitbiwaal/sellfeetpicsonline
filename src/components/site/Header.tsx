import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { MAIN_NAV } from "@/lib/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <Container className="flex h-[72px] items-center justify-between gap-4 md:h-20">
        <Logo priority className="h-11 md:h-[52px]" />
        <NavLinks items={MAIN_NAV} />
        <div className="flex items-center gap-2.5">
          <Link href="/best-platforms/" className="btn btn-primary btn-sm hidden sm:inline-flex">
            Get started <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <MobileMenu items={MAIN_NAV} />
        </div>
      </Container>
    </header>
  );
}
