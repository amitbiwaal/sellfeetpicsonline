import { Globe } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

const NETWORKS = [
  { key: "social_x", label: "X (Twitter)", Icon: XIcon },
  { key: "social_instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "social_tiktok", label: "TikTok", Icon: () => <Globe className="size-4" aria-hidden="true" /> },
  { key: "social_pinterest", label: "Pinterest", Icon: () => <Globe className="size-4" aria-hidden="true" /> },
  { key: "social_reddit", label: "Reddit", Icon: () => <Globe className="size-4" aria-hidden="true" /> },
] as const;

export function SocialLinks({ settings, className }: { settings: SiteSettings; className?: string }) {
  const links = NETWORKS.filter((n) => settings[n.key]);
  if (!links.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {links.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={settings[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
          >
            <Icon />
          </a>
        </li>
      ))}
    </ul>
  );
}
