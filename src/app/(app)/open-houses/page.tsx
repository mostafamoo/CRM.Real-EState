"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM, type OpenHouse } from "@/lib/store";
import { initials } from "@/lib/utils";
import {
  Plus, DoorOpen, Users, QrCode, Trash2, MoreHorizontal, UserPlus, ExternalLink,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const agents = ["Marcus Reed", "Diana Powell", "Naomi Lee", "Kenji Watanabe"];

export default function OpenHousesPage() {
  const openHouses = useCRM((s) => s.openHouses);
  const listings = useCRM((s) => s.listings);
  const addOpenHouse = useCRM((s) => s.addOpenHouse);
  const registerAttendee = useCRM((s) => s.registerAttendee);
  const deleteOpenHouse = useCRM((s) => s.deleteOpenHouse);
  const addLead = useCRM((s) => s.addLead);

  const [formOpen, setFormOpen] = useState(false);
  const [signinFor, setSigninFor] = useState<OpenHouse | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    listingId: listings[0]?.id ?? "",
    date: new Date().toISOString().split("T")[0],
    startTime: "1:00 PM",
    endTime: "4:00 PM",
    agent: agents[0],
  });

  const [attendee, setAttendee] = useState({ name: "", email: "", phone: "", interested: true });

  function createOpenHouse(e: React.FormEvent) {
    e.preventDefault();
    if (!form.listingId) { toast.error("Pick a listing"); return; }
    addOpenHouse(form);
    toast.success("Open house scheduled");
    setFormOpen(false);
  }

  function registerSignin(e: React.FormEvent) {
    e.preventDefault();
    if (!signinFor || !attendee.name || !attendee.email) { toast.error("Name and email required"); return; }
    registerAttendee(signinFor.id, { ...attendee, checkInAt: Date.now() });
    addLead({
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone || "—",
      source: "Walk-in",
      status: "new",
      budget: 0,
      city: "—",
      agent: signinFor.agent,
    });
    toast.success(`${attendee.name} signed in + lead created`);
    setAttendee({ name: "", email: "", phone: "", interested: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Open houses"
        description={`${openHouses.filter(o => o.status === "Upcoming").length} upcoming · ${openHouses.reduce((s, o) => s + o.attendees.length, 0)} total attendees`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Schedule open house
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {openHouses.length === 0 && (
          <Card className="lg:col-span-2"><CardContent className="p-12 text-center text-muted-foreground text-sm">
            <DoorOpen className="size-8 mx-auto mb-2 opacity-30" />
            No open houses scheduled.
          </CardContent></Card>
        )}
        {openHouses.map((oh) => {
          const listing = listings.find((l) => l.id === oh.listingId);
          return (
            <Card key={oh.id} className="overflow-hidden">
              <CardHeader className="flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{listing?.address ?? "Listing"}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {oh.date} · {oh.startTime} – {oh.endTime} · {oh.agentName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={oh.status === "Upcoming" ? "secondary" : oh.status === "Done" ? "muted" : "warning"}>{oh.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSigninFor(oh)}>
                        <UserPlus className="size-4" /> Sign-in attendee
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success(`QR generated for ${oh.id}`)}>
                        <QrCode className="size-4" /> Generate QR
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info(`Sharing flyer link`)}>
                        <ExternalLink className="size-4" /> Share flyer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(oh.id)}>
                        <Trash2 className="size-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>{oh.attendees.length} attendees</span>
                  {oh.attendees.length > 0 && (
                    <span>· {oh.attendees.filter((a) => a.interested).length} interested</span>
                  )}
                </div>
                {oh.attendees.length > 0 && (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1">
                    {oh.attendees.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-md bg-secondary/40 p-2">
                        <Avatar className="size-7"><AvatarFallback className="text-[10px]">{initials(a.name)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{a.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{a.email}</div>
                        </div>
                        {a.interested && <Badge variant="success">Interested</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSigninFor(oh)}>
                  <UserPlus className="size-4" /> Sign in attendee
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule open house</DialogTitle>
            <DialogDescription>Reach more buyers with a public showing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createOpenHouse} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Listing</Label>
              <Select value={form.listingId} onValueChange={(v) => setForm({ ...form, listingId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {listings.map((l) => <SelectItem key={l.id} value={l.id}>{l.address}, {l.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Agent</Label>
              <Select value={form.agent} onValueChange={(v) => setForm({ ...form, agent: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {agents.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Schedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={signinFor !== null} onOpenChange={(o) => !o && setSigninFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign-in sheet</DialogTitle>
            <DialogDescription>Register an attendee — they'll be added as a lead automatically.</DialogDescription>
          </DialogHeader>
          <form onSubmit={registerSignin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={attendee.name} onChange={(e) => setAttendee({ ...attendee, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={attendee.email} onChange={(e) => setAttendee({ ...attendee, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={attendee.phone} onChange={(e) => setAttendee({ ...attendee, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Interest level</Label>
              <Select value={attendee.interested ? "yes" : "no"} onValueChange={(v) => setAttendee({ ...attendee, interested: v === "yes" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Interested</SelectItem>
                  <SelectItem value="no">Just looking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setSigninFor(null)}>Done</Button>
              <Button type="submit">Sign in + create lead</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteOpenHouse(confirmId); toast.success("Open house deleted"); } }}
        title="Delete this open house?"
      />
    </div>
  );
}
