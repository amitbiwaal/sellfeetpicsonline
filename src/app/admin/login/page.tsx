import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { LOGO } from "@/lib/site";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getCurrentUser()) redirect("/admin/");
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(900px_400px_at_50%_-10%,rgba(255,61,139,0.14),transparent_60%),linear-gradient(180deg,#fff5f8,#ffffff)] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src={LOGO.src} alt="SellFeetOnline" width={LOGO.width} height={LOGO.height} loading="eager" className="h-14 w-auto" sizes="180px" />
          <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted">Sign in to manage your blog and pages.</p>
        </div>
        <div className="adm-card p-6 shadow-[0_30px_70px_-45px_rgba(168,21,78,0.55)] sm:p-8">
          <LoginForm next={typeof next === "string" ? next : undefined} />
        </div>
        <p className="mt-6 text-center text-sm text-subtle">
          <Link href="/" className="hover:text-brand">
            ← Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
