import { Logo } from "@/components/layout/logo";
import { Building2, Users, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col p-8 lg:p-12">
        <Logo />
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Estata CRM. All rights reserved.
        </div>
      </div>
      <div className="hidden lg:flex relative bg-sidebar text-sidebar-foreground p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30 [background:radial-gradient(60rem_50rem_at_120%_-10%,_var(--color-primary),_transparent)]" />
        <div className="relative flex flex-col justify-between w-full">
          <div className="space-y-4 max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-3 py-1 text-xs font-medium text-sidebar-foreground">
              <Sparkles className="size-3" /> Built for modern brokerages
            </span>
            <h2 className="text-3xl font-semibold tracking-tight leading-tight">
              The CRM your team actually
              <br />
              <span className="text-primary">opens every morning.</span>
            </h2>
            <p className="text-sidebar-foreground/70">
              Track leads, manage listings, and close deals — all in one elegant
              workspace tailored for real-estate professionals.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-12">
            <Stat icon={<Users className="size-4" />} value="12k+" label="Agents" />
            <Stat icon={<Building2 className="size-4" />} value="38k" label="Listings" />
            <Stat icon={<Sparkles className="size-4" />} value="$2.4B" label="Closed" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4">
      <div className="size-7 rounded-md bg-primary/15 text-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-3 text-xl font-semibold">{value}</div>
      <div className="text-xs text-sidebar-foreground/65">{label}</div>
    </div>
  );
}
