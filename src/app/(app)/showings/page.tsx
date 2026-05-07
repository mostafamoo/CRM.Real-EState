"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ShowingFormDialog } from "@/components/dialogs/showing-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM, type Showing } from "@/lib/store";
import { initials } from "@/lib/utils";
import { Plus, KeyRound, Star, MoreHorizontal, CheckCircle2, X, MessageSquare, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariant = {
  Scheduled: "secondary",
  Completed: "success",
  Cancelled: "muted",
  "No-show": "destructive",
} as const;

export default function ShowingsPage() {
  const showings = useCRM((s) => s.showings);
  const leads = useCRM((s) => s.leads);
  const listings = useCRM((s) => s.listings);
  const updateShowing = useCRM((s) => s.updateShowing);
  const deleteShowing = useCRM((s) => s.deleteShowing);

  const [filter, setFilter] = useState<"all" | "Scheduled" | "Completed" | "Cancelled">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [feedbackFor, setFeedbackFor] = useState<Showing | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState({ interested: true, rating: 4, notes: "" });

  const filtered = useMemo(() => {
    if (filter === "all") return showings;
    return showings.filter((s) => s.status === filter);
  }, [showings, filter]);

  function submitFeedback() {
    if (!feedbackFor) return;
    updateShowing(feedbackFor.id, { status: "Completed", feedback });
    toast.success("Feedback recorded");
    setFeedbackFor(null);
    setFeedback({ interested: true, rating: 4, notes: "" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Showings"
        description={`${showings.filter(s => s.status === "Scheduled").length} upcoming · ${showings.filter(s => s.status === "Completed").length} completed`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Schedule showing
          </Button>
        }
      />

      <div className="flex gap-2">
        {(["all", "Scheduled", "Completed", "Cancelled"] as const).map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              <KeyRound className="size-8 mx-auto mb-2 opacity-30" />
              No showings.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((sh) => {
                const lead = leads.find((l) => l.id === sh.leadId);
                const listing = listings.find((l) => l.id === sh.listingId);
                return (
                  <li key={sh.id} className="flex items-center gap-4 p-4 hover:bg-secondary/40">
                    <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                      <KeyRound className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{listing?.address ?? "Listing"}</span>
                        <Badge variant="outline" className="text-[10px]">{sh.id}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {sh.date} at {sh.time} · {sh.agentName}
                      </div>
                      {sh.feedback && (
                        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`size-3 ${i < sh.feedback!.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                            ))}
                          </span>
                          <span>· {sh.feedback.interested ? "Interested" : "Not interested"}</span>
                          <span className="line-clamp-1">"{sh.feedback.notes}"</span>
                        </div>
                      )}
                    </div>
                    {lead && (
                      <Link href={`/leads/${lead.id}`} className="flex items-center gap-2 hover:bg-secondary/60 rounded-md px-2 py-1">
                        <Avatar className="size-8"><AvatarFallback className="text-[10px]">{initials(lead.name)}</AvatarFallback></Avatar>
                        <span className="text-sm font-medium">{lead.name}</span>
                      </Link>
                    )}
                    <Badge variant={statusVariant[sh.status]}>{sh.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {sh.status === "Scheduled" && (
                          <>
                            <DropdownMenuItem onClick={() => setFeedbackFor(sh)}>
                              <CheckCircle2 className="size-4" /> Mark complete + feedback
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateShowing(sh.id, { status: "Cancelled" }); toast("Cancelled"); }}>
                              <X className="size-4" /> Cancel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { updateShowing(sh.id, { status: "No-show" }); toast("Marked no-show"); }}>
                              <X className="size-4" /> No-show
                            </DropdownMenuItem>
                          </>
                        )}
                        {sh.status === "Completed" && !sh.feedback && (
                          <DropdownMenuItem onClick={() => setFeedbackFor(sh)}>
                            <MessageSquare className="size-4" /> Add feedback
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(sh.id)}>
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ShowingFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <Dialog open={feedbackFor !== null} onOpenChange={(o) => !o && setFeedbackFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Showing feedback</DialogTitle>
            <DialogDescription>How did the tour go?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Interest level</Label>
              <Select value={feedback.interested ? "yes" : "no"} onValueChange={(v) => setFeedback({ ...feedback, interested: v === "yes" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Interested</SelectItem>
                  <SelectItem value="no">Not interested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setFeedback({ ...feedback, rating: n })} className="p-1">
                    <Star className={`size-6 ${n <= feedback.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={feedback.notes} onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setFeedbackFor(null)}>Cancel</Button>
            <Button onClick={submitFeedback}>Save feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteShowing(confirmId); toast.success("Showing deleted"); } }}
        title="Delete this showing?"
      />
    </div>
  );
}
