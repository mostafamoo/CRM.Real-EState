"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import {
  UserPlus, UserCog, UserMinus, Handshake, Building2, FileText, KeyRound,
  DoorOpen, FileCheck, MailPlus, Zap, MessageCircle, CheckCircle2, Activity as ActivityIcon, Search,
} from "lucide-react";
import type { ActivityKind } from "@/lib/types";

const kindIcon: Record<ActivityKind, { icon: React.ElementType; bg: string }> = {
  "lead.created": { icon: UserPlus, bg: "bg-primary/15 text-primary" },
  "lead.updated": { icon: UserCog, bg: "bg-secondary text-secondary-foreground" },
  "lead.deleted": { icon: UserMinus, bg: "bg-destructive/15 text-destructive" },
  "deal.created": { icon: Handshake, bg: "bg-primary/15 text-primary" },
  "deal.stage": { icon: Handshake, bg: "bg-warning/20 text-warning-foreground" },
  "deal.deleted": { icon: Handshake, bg: "bg-destructive/15 text-destructive" },
  "listing.created": { icon: Building2, bg: "bg-primary/15 text-primary" },
  "listing.deleted": { icon: Building2, bg: "bg-destructive/15 text-destructive" },
  "task.completed": { icon: CheckCircle2, bg: "bg-success/15 text-success" },
  "task.created": { icon: FileText, bg: "bg-secondary text-secondary-foreground" },
  "showing.scheduled": { icon: KeyRound, bg: "bg-primary/15 text-primary" },
  "showing.completed": { icon: KeyRound, bg: "bg-success/15 text-success" },
  "openhouse.scheduled": { icon: DoorOpen, bg: "bg-accent text-accent-foreground" },
  "document.signed": { icon: FileCheck, bg: "bg-success/15 text-success" },
  "document.sent": { icon: FileText, bg: "bg-primary/15 text-primary" },
  "campaign.sent": { icon: MailPlus, bg: "bg-primary/15 text-primary" },
  "automation.run": { icon: Zap, bg: "bg-warning/20 text-warning-foreground" },
  "comment.added": { icon: MessageCircle, bg: "bg-secondary text-secondary-foreground" },
};

export default function ActivityPage() {
  const activity = useCRM((s) => s.activity);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = activity;
    if (filter !== "all") list = list.filter((a) => a.kind.startsWith(filter));
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) ||
        a.actor.toLowerCase().includes(q) ||
        (a.detail?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [activity, filter, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((a) => {
      const key = formatDay(a.createdAt);
      groups[key] = groups[key] || [];
      groups[key].push(a);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description={`${activity.length} events across your workspace`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-64 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search activity…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="deal">Deals</SelectItem>
            <SelectItem value="listing">Listings</SelectItem>
            <SelectItem value="task">Tasks</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="showing">Showings</SelectItem>
            <SelectItem value="openhouse">Open Houses</SelectItem>
            <SelectItem value="campaign">Campaigns</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <ActivityIcon className="size-10 mx-auto mb-2 opacity-30" />
              No activity yet
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {Object.entries(grouped).map(([day, items]) => (
                <div key={day} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</span>
                    <hr className="flex-1 border-border" />
                  </div>
                  <ul className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-border">
                    {items.map((a) => {
                      const meta = kindIcon[a.kind] ?? { icon: ActivityIcon, bg: "bg-secondary text-muted-foreground" };
                      const Icon = meta.icon;
                      const link = entityLink(a);
                      return (
                        <li key={a.id} className="relative pl-12">
                          <span className={`absolute left-0 top-1 flex size-8 items-center justify-center rounded-full ${meta.bg}`}>
                            <Icon className="size-4" />
                          </span>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{a.actor}</span>{" "}
                                <span className="text-muted-foreground">{a.title.toLowerCase()}</span>
                              </p>
                              {a.detail && (
                                link ? (
                                  <Link href={link} className="text-sm text-primary hover:underline truncate block">
                                    {a.detail}
                                  </Link>
                                ) : (
                                  <p className="text-sm text-muted-foreground truncate">{a.detail}</p>
                                )
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{timeShort(a.createdAt)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function entityLink(a: { entityType?: string; entityId?: string }): string | null {
  if (!a.entityType || !a.entityId) return null;
  switch (a.entityType) {
    case "lead": return `/leads/${a.entityId}`;
    case "deal": return `/deals`;
    case "listing": return `/listings/${a.entityId}`;
    case "document": return `/documents`;
    case "task": return `/tasks`;
    default: return null;
  }
}

function formatDay(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isSameDay) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeShort(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
