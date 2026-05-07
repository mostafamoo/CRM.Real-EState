"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";

type Invite = { email: string; role: string; sent: string; status: "Pending" | "Expired" };

const initial: Invite[] = [
  { email: "kenji@bayrealty.com", role: "Agent", sent: "2 days ago", status: "Pending" },
  { email: "amir.nuri@bayrealty.com", role: "Agent", sent: "5 days ago", status: "Pending" },
  { email: "claire.wu@bayrealty.com", role: "Manager", sent: "12 days ago", status: "Expired" },
];

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invite[]>(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent");

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    setInvitations((arr) => [{ email, role, sent: "Just now", status: "Pending" }, ...arr]);
    toast.success(`Invitation sent to ${email}`);
    setEmail("");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send invitation</CardTitle>
          <CardDescription>Invite agents and admins to your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={send} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2">
            <div className="space-y-1.5">
              <Label>Email address</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@yourbrokerage.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="self-end">
              <Button type="submit"><Send className="size-4" /> Send invite</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Pending invitations</CardTitle></CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No pending invitations.</div>
          ) : (
            <ul className="divide-y divide-border">
              {invitations.map((inv) => (
                <li key={inv.email + inv.sent} className="flex items-center gap-3 p-4">
                  <div className="size-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                    {inv.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">Invited as {inv.role} · {inv.sent}</div>
                  </div>
                  <Badge variant={inv.status === "Pending" ? "warning" : "muted"}>{inv.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInvitations((arr) => arr.map((i) => i.email === inv.email ? { ...i, sent: "Just now", status: "Pending" } : i));
                      toast.success("Invitation resent");
                    }}
                  >
                    Resend
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setInvitations((arr) => arr.filter((i) => i.email !== inv.email));
                      toast.success("Invitation revoked");
                    }}
                  >
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
