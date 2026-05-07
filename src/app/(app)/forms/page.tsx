"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM } from "@/lib/store";
import {
  Plus, Code, ExternalLink, Copy, QrCode, Trash2, FileSpreadsheet, MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FormsPage() {
  const forms = useCRM((s) => s.forms);
  const addForm = useCRM((s) => s.addForm);
  const updateForm = useCRM((s) => s.updateForm);
  const deleteForm = useCRM((s) => s.deleteForm);
  const recordSubmission = useCRM((s) => s.recordSubmission);
  const addLead = useCRM((s) => s.addLead);

  const [formOpen, setFormOpen] = useState(false);
  const [embedFor, setEmbedFor] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", source: "Microsite" });

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Form name required"); return; }
    addForm({
      name: form.name,
      source: form.source,
      active: true,
      fields: [
        { id: "f1", label: "Full name", type: "text", required: true },
        { id: "f2", label: "Email", type: "email", required: true },
        { id: "f3", label: "Phone", type: "phone", required: false },
      ],
    });
    toast.success("Form created");
    setFormOpen(false);
    setForm({ name: "", source: "Microsite" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead capture forms"
        description={`${forms.length} forms · ${forms.reduce((s, f) => s + f.submissions, 0)} total submissions`}
        actions={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> New form
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {forms.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="p-12 text-center text-muted-foreground text-sm">
              <FileSpreadsheet className="size-8 mx-auto mb-2 opacity-30" />
              No forms yet.
            </CardContent>
          </Card>
        )}
        {forms.map((f) => (
          <Card key={f.id}>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{f.name}</CardTitle>
                <CardDescription>{f.source}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreviewFor(f.id)}>
                    <ExternalLink className="size-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEmbedFor(f.id)}>
                    <Code className="size-4" /> Embed code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("QR code generated")}>
                    <QrCode className="size-4" /> QR code
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirmId(f.id)}>
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{f.fields.length} fields · {f.submissions} submissions</span>
                <Switch checked={f.active} onCheckedChange={() => { updateForm(f.id, { active: !f.active }); toast(f.active ? "Form paused" : "Form activated"); }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewFor(f.id)}>
                  <ExternalLink className="size-3.5" /> Preview
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEmbedFor(f.id)}>
                  <Code className="size-3.5" /> Embed
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New form</DialogTitle>
            <DialogDescription>Capture leads from your website, social media, or QR codes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Form name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Buyer Inquiry" />
            </div>
            <div className="space-y-1.5">
              <Label>Source / context</Label>
              <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Microsite" />
            </div>
            <div className="text-xs text-muted-foreground rounded-md bg-secondary/40 p-3">
              Default fields will be: Full name, Email, Phone. You can edit fields after creating.
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Create form</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Embed dialog */}
      <Dialog open={embedFor !== null} onOpenChange={(o) => !o && setEmbedFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed code</DialogTitle>
            <DialogDescription>Paste this snippet anywhere on your website.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <pre className="rounded-lg border border-border bg-secondary/40 p-3 text-xs overflow-x-auto">
{`<script src="https://embed.estata.app/forms.js"></script>
<div data-estata-form="${embedFor}"></div>`}
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`<script src="https://embed.estata.app/forms.js"></script>\n<div data-estata-form="${embedFor}"></div>`);
                toast.success("Embed code copied");
              }}
            >
              <Copy className="size-4" /> Copy code
            </Button>
            <p className="text-xs text-muted-foreground">
              Public URL: <code className="rounded bg-secondary px-1.5 py-0.5">https://forms.estata.app/{embedFor}</code>
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEmbedFor(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog (live form) */}
      <Dialog open={previewFor !== null} onOpenChange={(o) => !o && setPreviewFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{forms.find((f) => f.id === previewFor)?.name ?? ""}</DialogTitle>
            <DialogDescription>Live preview — submitting will create a real lead.</DialogDescription>
          </DialogHeader>
          <PreviewForm
            formId={previewFor!}
            onSubmit={(data) => {
              if (!previewFor) return;
              addLead({
                name: data.name || "Anonymous",
                email: data.email || "—",
                phone: data.phone || "—",
                source: "Website",
                status: "new",
                budget: 0,
                city: "—",
                agent: "Taylor Lambert",
              });
              recordSubmission(previewFor);
              toast.success("Lead created from form");
              setPreviewFor(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        onConfirm={() => { if (confirmId) { deleteForm(confirmId); toast.success("Form deleted"); } }}
        title="Delete this form?"
      />
    </div>
  );
}

function PreviewForm({ formId, onSubmit }: { formId: string; onSubmit: (d: Record<string, string>) => void }) {
  const form = useCRM((s) => s.forms.find((f) => f.id === formId));
  const [values, setValues] = useState<Record<string, string>>({});
  if (!form) return null;

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ name: values.f1, email: values.f2, phone: values.f3 }); }}
      className="space-y-3"
    >
      {form.fields.map((field) => (
        <div key={field.id} className="space-y-1.5">
          <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
          {field.type === "select" ? (
            <select
              required={field.required}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
            >
              <option value="">Select…</option>
              {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <Input
              type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              required={field.required}
              value={values[field.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.id]: e.target.value }))}
            />
          )}
        </div>
      ))}
      <Button type="submit" className="w-full">Submit</Button>
    </form>
  );
}
