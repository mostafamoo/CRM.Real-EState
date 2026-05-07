"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignFormDialog } from "@/components/dialogs/campaign-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCRM } from "@/lib/store";
import { Plus, Mail, MousePointerClick, Send, MoreHorizontal, Trash2, Play, Pause } from "lucide-react";

const statusVariant = {
  Active: "success",
  Scheduled: "secondary",
  Paused: "warning",
  Draft: "muted",
} as const;

export default function CampaignsPage() {
  const campaigns = useCRM((s) => s.campaigns);
  const updateCampaign = useCRM((s) => s.updateCampaign);
  const deleteCampaign = useCRM((s) => s.deleteCampaign);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const openRate = totalSent ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
  const clickRate = totalSent ? ((totalClicked / totalSent) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Email and SMS campaigns to nurture your leads"
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New campaign
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Send className="size-4" /> Total sent</div><div className="mt-1 text-2xl font-semibold">{totalSent.toLocaleString()}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="size-4" /> Open rate</div><div className="mt-1 text-2xl font-semibold">{openRate}%</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="flex items-center gap-2 text-sm text-muted-foreground"><MousePointerClick className="size-4" /> Click rate</div><div className="mt-1 text-2xl font-semibold">{clickRate}%</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No campaigns yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {campaigns.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-secondary/40 transition-colors">
                  <div className="flex-1 min-w-64">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.id} · {c.type}</div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <Stat label="Sent" value={c.sent.toLocaleString()} />
                    <Stat label="Opened" value={c.opened.toLocaleString()} />
                    <Stat label="Clicked" value={c.clicked.toLocaleString()} />
                  </div>
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {c.status === "Paused" && (
                        <DropdownMenuItem onClick={() => { updateCampaign(c.id, { status: "Active" }); toast.success("Campaign resumed"); }}>
                          <Play className="size-4" /> Resume
                        </DropdownMenuItem>
                      )}
                      {c.status === "Active" && (
                        <DropdownMenuItem onClick={() => { updateCampaign(c.id, { status: "Paused" }); toast("Campaign paused"); }}>
                          <Pause className="size-4" /> Pause
                        </DropdownMenuItem>
                      )}
                      {c.status === "Draft" && (
                        <DropdownMenuItem onClick={() => { updateCampaign(c.id, { status: "Scheduled" }); toast.success("Campaign scheduled"); }}>
                          <Send className="size-4" /> Schedule send
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => toast.info(`Viewing ${c.name}`)}>View report</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(c.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CampaignFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteCampaign(confirmId); toast.success("Campaign deleted"); } }}
        title="Delete this campaign?"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right min-w-12">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
