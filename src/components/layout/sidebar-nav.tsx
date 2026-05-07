"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, UserCircle2, Handshake, FileText, Network,
  Megaphone, Globe, MousePointerClick, Zap, CheckSquare, CalendarDays, BarChart3,
  Plug, Settings, HelpCircle, Inbox, FolderOpen, Activity, KeyRound, DoorOpen,
  Wallet, FileSpreadsheet, GitBranch, Sparkles, LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useCRM } from "@/lib/store";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export function SidebarNav() {
  const pathname = usePathname();
  const inboxUnread = useCRM((s) => s.threads.reduce((sum, t) => sum + t.unread, 0));
  const docsCount = useCRM((s) => s.documents.length);

  const sections: NavSection[] = [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Inbox", href: "/inbox", icon: Inbox, badge: inboxUnread > 0 ? inboxUnread : undefined },
        { label: "Activity", href: "/activity", icon: Activity },
      ],
    },
    {
      title: "CRM",
      items: [
        { label: "Listings", href: "/listings", icon: Building2 },
        { label: "Leads", href: "/leads", icon: Users },
        { label: "Contacts", href: "/contacts", icon: UserCircle2 },
        { label: "Deals", href: "/deals", icon: Handshake },
        { label: "Pipeline", href: "/pipeline", icon: Network },
        { label: "Offers", href: "/offers", icon: FileText },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "Showings", href: "/showings", icon: KeyRound },
        { label: "Open Houses", href: "/open-houses", icon: DoorOpen },
        { label: "Commissions", href: "/commissions", icon: Wallet },
        { label: "Documents", href: "/documents", icon: FolderOpen, badge: docsCount > 0 ? docsCount : undefined },
      ],
    },
    {
      title: "Marketing",
      items: [
        { label: "Campaigns", href: "/campaigns", icon: Megaphone },
        { label: "Sequences", href: "/sequences", icon: GitBranch },
        { label: "Microsite", href: "/microsite", icon: Globe },
        { label: "Forms", href: "/forms", icon: FileSpreadsheet },
        { label: "Interactions", href: "/interactions", icon: MousePointerClick },
      ],
    },
    {
      title: "Productivity",
      items: [
        { label: "Tasks", href: "/tasks", icon: CheckSquare },
        { label: "Calendar", href: "/calendar", icon: CalendarDays },
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Automation", href: "/automation", icon: Zap },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Integrations", href: "/integrations", icon: Plug },
        { label: "Settings", href: "/settings/profile", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border max-h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-sidebar-border shrink-0">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <Logo className="text-sidebar-foreground" />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        {sections.map((section, idx) => (
          <div key={idx} className="px-3 pb-2">
            {section.title && (
              <div className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">
                {section.title}
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
                          : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" strokeWidth={2} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          active ? "bg-sidebar-active-foreground/15 text-sidebar-active-foreground" : "bg-primary/15 text-primary"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 shrink-0">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <HelpCircle className="size-4" />
          Help & Support
        </Link>
      </div>
    </aside>
  );
}
