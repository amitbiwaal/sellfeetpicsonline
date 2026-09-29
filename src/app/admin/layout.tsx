import type { Metadata } from "next";
import { Toaster } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · SellFeetOnline Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf6f8] text-body">
      {children}
      <Toaster />
    </div>
  );
}
