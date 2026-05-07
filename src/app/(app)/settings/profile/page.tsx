"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCRM } from "@/lib/store";
import { initials } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function ProfileSettingsPage() {
  const user = useCRM((s) => s.user);
  const updateUser = useCRM((s) => s.updateUser);
  const resetAll = useCRM((s) => s.resetAll);

  const [form, setForm] = useState(user);
  const [pwOpen, setPwOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => { setForm(user); }, [user]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateUser(form);
    toast.success("Profile saved");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Update how others see you across Estata.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">{initials(`${form.firstName} ${form.lastName}`) || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">Profile photo</h3>
                <p className="text-xs text-muted-foreground">PNG or JPG, max 2MB.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Upload coming soon — using initials for now")}>Upload</Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
              <Field label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
              <Field label="License #" value={form.license} onChange={(v) => setForm({ ...form, license: v })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setForm(user)}>Cancel</Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>Change password</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("2FA setup coming soon")}>Two-factor authentication</Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => toast.info("Active sessions: 1 (this device)")}>Active sessions</Button>
          <hr className="border-border" />
          <Button variant="outline" className="w-full justify-start text-destructive" onClick={() => setResetOpen(true)}>
            Reset all data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Enter your current and new password.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Password updated");
              setPwOpen(false);
            }}
          >
            <div className="space-y-1.5"><Label>Current password</Label><Input type="password" /></div>
            <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
            <div className="space-y-1.5"><Label>Confirm new password</Label><Input type="password" /></div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This will erase all leads, deals, listings, and settings, and reload the page with seed data. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => resetAll()}>Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} type={type} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
