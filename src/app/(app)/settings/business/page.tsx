"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCRM } from "@/lib/store";

export default function BusinessSettingsPage() {
  const business = useCRM((s) => s.business);
  const updateBusiness = useCRM((s) => s.updateBusiness);
  const [form, setForm] = useState(business);

  useEffect(() => { setForm(business); }, [business]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateBusiness(form);
    toast.success("Business profile saved");
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>Public information shown to leads and on your microsite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Business name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="DBA" value={form.dba} onChange={(v) => setForm({ ...form, dba: v })} />
            <Field label="License #" value={form.license} onChange={(v) => setForm({ ...form, license: v })} />
            <Field label="Tax ID (EIN)" value={form.ein} onChange={(v) => setForm({ ...form, ein: v })} />
            <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
            <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
            <Field label="ZIP" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setForm(business)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
