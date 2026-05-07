"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";

const tabs = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Business", href: "/settings/business" },
  { label: "Organization", href: "/settings/organization" },
  { label: "Invitations", href: "/settings/invitations" },
  { label: "Seats", href: "/settings/seats" },
  { label: "Billing", href: "/settings/billing" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account, organization, and billing" />

      <div className="border-b border-border">
        <nav className="flex flex-wrap gap-1 -mb-px">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>{children}</div>
    </div>
  );
}
