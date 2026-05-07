"use client";

import { Bell, Search, Plus, Sun, Moon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadFormDialog } from "@/components/dialogs/lead-form";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";

export function Topbar() {
  const router = useRouter();
  const user = useCRM((s) => s.user);
  const leads = useCRM((s) => s.leads);
  const deals = useCRM((s) => s.deals);
  const listings = useCRM((s) => s.listings);
  const contacts = useCRM((s) => s.contacts);
  const notifications = useCRM((s) => s.notifications);
  const markAllRead = useCRM((s) => s.markAllRead);

  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark =
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const results = useMemo(() => {
    if (!query) return null;
    const q = query.toLowerCase();
    return {
      leads: leads.filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.toLowerCase().includes(q)).slice(0, 5),
      deals: deals.filter((d) => d.title.toLowerCase().includes(q) || d.client.toLowerCase().includes(q)).slice(0, 5),
      listings: listings.filter((l) => l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)).slice(0, 5),
      contacts: contacts.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [query, leads, deals, listings, contacts]);

  const total = results
    ? results.leads.length + results.deals.length + results.listings.length + results.contacts.length
    : 0;

  const unread = notifications.filter((n) => !n.read).length;

  function go(path: string) {
    router.push(path);
    setOpen(false);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 backdrop-blur px-4 lg:px-6">
      <div ref={containerRef} className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search leads, deals, contacts…"
          className="pl-9 h-9 bg-secondary/60 border-transparent focus-visible:bg-background"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>

        {open && query && results && (
          <div className="absolute top-full mt-2 w-[28rem] max-h-[28rem] overflow-y-auto rounded-xl border border-border bg-popover shadow-xl p-2 scrollbar-thin">
            {total === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No results for "{query}"</div>
            ) : (
              <>
                {results.leads.length > 0 && (
                  <Group title="Leads">
                    {results.leads.map((l) => (
                      <ResultItem key={l.id} onSelect={() => go(`/leads/${l.id}`)} primary={l.name} secondary={l.email} badge="Lead" />
                    ))}
                  </Group>
                )}
                {results.deals.length > 0 && (
                  <Group title="Deals">
                    {results.deals.map((d) => (
                      <ResultItem key={d.id} onSelect={() => go("/deals")} primary={d.title} secondary={d.client} badge="Deal" />
                    ))}
                  </Group>
                )}
                {results.listings.length > 0 && (
                  <Group title="Listings">
                    {results.listings.map((l) => (
                      <ResultItem key={l.id} onSelect={() => go("/listings")} primary={l.address} secondary={`${l.city}, ${l.state}`} badge="Listing" />
                    ))}
                  </Group>
                )}
                {results.contacts.length > 0 && (
                  <Group title="Contacts">
                    {results.contacts.map((c) => (
                      <ResultItem key={c.id} onSelect={() => go("/contacts")} primary={c.name} secondary={c.role} badge="Contact" />
                    ))}
                  </Group>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="default" size="sm" className="hidden md:inline-flex" onClick={() => setLeadFormOpen(true)}>
          <Plus className="size-4" /> New Lead
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>

        <DropdownMenu onOpenChange={(o) => { if (!o) markAllRead(); }}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto scrollbar-thin">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unread > 0 && <span className="text-[10px] text-primary normal-case font-normal">{unread} new</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">All caught up!</div>
            ) : (
              notifications.slice(0, 12).map((n) => (
                <div key={n.id} className="px-2 py-2 hover:bg-secondary/40 rounded-md">
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      {n.body && <div className="text-xs text-muted-foreground truncate">{n.body}</div>}
                      <div className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full p-1 hover:bg-secondary transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials(`${user.firstName} ${user.lastName}`) || "TL"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground normal-case tracking-normal">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground normal-case tracking-normal">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/settings/profile">Profile Settings</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings/business">Business Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href="/settings/billing">Billing</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { toast.success("Signed out"); router.push("/login"); }} className="text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LeadFormDialog open={leadFormOpen} onOpenChange={setLeadFormOpen} />
    </header>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function ResultItem({
  primary,
  secondary,
  badge,
  onSelect,
}: {
  primary: string;
  secondary: string;
  badge: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-secondary/60 text-left"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{primary}</div>
        <div className="text-xs text-muted-foreground truncate">{secondary}</div>
      </div>
      <span className="text-[10px] text-muted-foreground rounded border border-border px-1.5 py-0.5">
        {badge}
      </span>
    </button>
  );
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `just now`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
